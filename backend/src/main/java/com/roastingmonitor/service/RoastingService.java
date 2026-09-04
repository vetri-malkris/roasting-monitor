package com.roastingmonitor.service;

import com.roastingmonitor.dto.BatchRequest;
import com.roastingmonitor.dto.LoginRequest;
import com.roastingmonitor.dto.LoginResponse;
import com.roastingmonitor.dto.MaterialRequest;
import com.roastingmonitor.model.RawMaterial;
import com.roastingmonitor.model.Role;
import com.roastingmonitor.model.RoastingBatch;
import com.roastingmonitor.model.User;
import com.roastingmonitor.repository.RawMaterialRepository;
import com.roastingmonitor.repository.RoastingBatchRepository;
import com.roastingmonitor.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.List;

@Service
public class RoastingService {

  private final UserRepository users;
  private final RawMaterialRepository materials;
  private final RoastingBatchRepository batches;

  private final BCryptPasswordEncoder encoder =
          new BCryptPasswordEncoder();

  public RoastingService(
          UserRepository u,
          RawMaterialRepository m,
          RoastingBatchRepository b) {

    users = u;
    materials = m;
    batches = b;
  }

  public LoginResponse login(LoginRequest r) {

    User u = users
            .findByUsername(r.username().toLowerCase())
            .orElseThrow(() ->
                    new IllegalArgumentException(
                            "Incorrect username or password."
                    ));

    if (!encoder.matches(r.password(), u.getPassword())) {
      throw new IllegalArgumentException(
              "Incorrect username or password."
      );
    }

    return new LoginResponse(
            u.getId(),
            u.getUsername(),
            u.getRole().name().toLowerCase(),
            u.getRole() == Role.ADMIN ? "Admin" : "Operator"
    );
  }

  public List<RawMaterial> materials() {
    return materials.findAll();
  }

  @Transactional
  public RawMaterial addMaterial(MaterialRequest r) {

    if (materials.findByNameIgnoreCase(r.name()).isPresent()) {
      throw new IllegalArgumentException(
              "This raw material already exists."
      );
    }

    RawMaterial m = new RawMaterial(
            r.name(),
            scale(r.quantity()),
            scale(r.standardLossPct())
    );

    m.setBatchNumber(blank(r.batchNumber()));
    m.setSupplier(blank(r.supplier()));

    return materials.save(m);
  }

  public List<RoastingBatch> allBatches() {
    return batches.findAllByOrderByCreatedAtDesc();
  }

  public List<RoastingBatch> myBatches(String user) {
    return batches.findTop10ByCreatedByOrderByCreatedAtDesc(user);
  }

  @Transactional
  public RoastingBatch createBatch(
          BatchRequest r,
          String username) {

    return save(null, r, username);
  }

  @Transactional
  public RoastingBatch updateBatch(
          Long id,
          BatchRequest r,
          String username) {

    RoastingBatch b = batches
            .findById(id)
            .orElseThrow(() ->
                    new EntityNotFoundException(
                            "Batch not found"
                    ));

    restore(b.getMaterial(), b.getInputQty());

    try {
      return save(b, r, username);
    } catch (RuntimeException ex) {

      deduct(
              b.getMaterial(),
              b.getInputQty()
      );

      throw ex;
    }
  }

  @Transactional
  public void deleteBatch(Long id) {

    RoastingBatch b = batches
            .findById(id)
            .orElseThrow();

    restore(
            b.getMaterial(),
            b.getInputQty()
    );

    batches.delete(b);
  }

  private RoastingBatch save(
          RoastingBatch b,
          BatchRequest r,
          String username) {

    if (r.outputQty().compareTo(r.inputQty()) > 0) {
      throw new IllegalArgumentException(
              "The output can't be more than what went in."
      );
    }

    RawMaterial m = materials
            .findByNameIgnoreCase(r.material())
            .orElseThrow(() ->
                    new IllegalArgumentException(
                            "Raw material not found."
                    ));

    if (r.inputQty().compareTo(m.getQuantity()) > 0) {
      throw new IllegalArgumentException(
              "Not enough " +
                      m.getName() +
                      " in stock (" +
                      m.getQuantity() +
                      " kg available)."
      );
    }

    deduct(
            m.getName(),
            r.inputQty()
    );

    BigDecimal input = scale(r.inputQty());
    BigDecimal output = scale(r.outputQty());
    BigDecimal std = scale(m.getStandardLossPct());

    BigDecimal loss =
            scale(input.subtract(output));

    BigDecimal lossPct =
            pct(loss, input);

    BigDecimal yieldPct =
            pct(output, input);

    BigDecimal stdKg =
            scale(
                    input
                            .multiply(std)
                            .divide(
                                    new BigDecimal("100"),
                                    8,
                                    RoundingMode.HALF_UP
                            )
            );

    BigDecimal expected =
            scale(input.subtract(stdKg));

    BigDecimal variance =
            scale(loss.subtract(stdKg));

    BigDecimal variancePct =
            scale(lossPct.subtract(std));

    if (b == null) {

      b = new RoastingBatch();

      b.setBatchNo(nextBatchNo());

      b.setCreatedAt(
              OffsetDateTime.now()
      );

      b.setCreatedBy(username);
    }

    b.setMaterial(m.getName());
    b.setInputQty(input);
    b.setOutputQty(output);
    b.setLoss(loss);
    b.setLossPct(lossPct);
    b.setYieldPct(yieldPct);
    b.setStdLossKg(stdKg);
    b.setStdLossPct(std);
    b.setExpectedOutputKg(expected);
    b.setVarianceKg(variance);
    b.setVariancePct(variancePct);
    b.setRemarks(blank(r.remarks()));

    return batches.save(b);
  }

  private String nextBatchNo() {

    return String.format(
            "RB-%04d",
            batches.count() + 1
    );
  }

  private void deduct(
          String name,
          BigDecimal q) {

    RawMaterial m = materials
            .findByNameIgnoreCase(name)
            .orElseThrow();

    m.setQuantity(
            scale(
                    m.getQuantity().subtract(q)
            )
    );

    materials.save(m);
  }

  private void restore(
          String name,
          BigDecimal q) {

    materials
            .findByNameIgnoreCase(name)
            .ifPresent(m -> {

              m.setQuantity(
                      scale(
                              m.getQuantity().add(q)
                      )
              );

              materials.save(m);
            });
  }

  private static BigDecimal pct(
          BigDecimal a,
          BigDecimal b) {

    return scale(
            a.multiply(new BigDecimal("100"))
                    .divide(
                            b,
                            8,
                            RoundingMode.HALF_UP
                    )
    );
  }

  private static BigDecimal scale(
          BigDecimal n) {

    return n.setScale(
            2,
            RoundingMode.HALF_UP
    );
  }

  private static String blank(String s) {

    return s == null || s.isBlank()
            ? null
            : s.trim();
  }
}