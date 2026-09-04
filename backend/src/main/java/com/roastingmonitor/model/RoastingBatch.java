package com.roastingmonitor.model;

import jakarta.persistence.*;
import java.math.BigDecimal; import java.time.OffsetDateTime;

@Entity @Table(name="roasting_batches")
public class RoastingBatch {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
  @Column(nullable=false,unique=true) private String batchNo;
  @Column(nullable=false) private String material;
  @Column(nullable=false,precision=12,scale=2) private BigDecimal inputQty;
  @Column(nullable=false,precision=12,scale=2) private BigDecimal outputQty;
  @Column(nullable=false,precision=12,scale=2) private BigDecimal loss;
  @Column(nullable=false,precision=7,scale=2) private BigDecimal lossPct;
  @Column(nullable=false,precision=7,scale=2) private BigDecimal yieldPct;
  @Column(nullable=false,precision=12,scale=2) private BigDecimal stdLossKg;
  @Column(nullable=false,precision=7,scale=2) private BigDecimal stdLossPct;
  @Column(nullable=false,precision=12,scale=2) private BigDecimal expectedOutputKg;
  @Column(nullable=false,precision=12,scale=2) private BigDecimal varianceKg;
  @Column(nullable=false,precision=7,scale=2) private BigDecimal variancePct;
  @Column(length=2000) private String remarks;
  @Column(nullable=false) private OffsetDateTime createdAt;
  @Column(nullable=false) private String createdBy;
  public RoastingBatch() {}
  public Long getId(){return id;} public String getBatchNo(){return batchNo;} public String getMaterial(){return material;} public BigDecimal getInputQty(){return inputQty;} public BigDecimal getOutputQty(){return outputQty;} public BigDecimal getLoss(){return loss;} public BigDecimal getLossPct(){return lossPct;} public BigDecimal getYieldPct(){return yieldPct;} public BigDecimal getStdLossKg(){return stdLossKg;} public BigDecimal getStdLossPct(){return stdLossPct;} public BigDecimal getExpectedOutputKg(){return expectedOutputKg;} public BigDecimal getVarianceKg(){return varianceKg;} public BigDecimal getVariancePct(){return variancePct;} public String getRemarks(){return remarks;} public OffsetDateTime getCreatedAt(){return createdAt;} public String getCreatedBy(){return createdBy;}
  public void setBatchNo(String v){batchNo=v;} public void setMaterial(String v){material=v;} public void setInputQty(BigDecimal v){inputQty=v;} public void setOutputQty(BigDecimal v){outputQty=v;} public void setLoss(BigDecimal v){loss=v;} public void setLossPct(BigDecimal v){lossPct=v;} public void setYieldPct(BigDecimal v){yieldPct=v;} public void setStdLossKg(BigDecimal v){stdLossKg=v;} public void setStdLossPct(BigDecimal v){stdLossPct=v;} public void setExpectedOutputKg(BigDecimal v){expectedOutputKg=v;} public void setVarianceKg(BigDecimal v){varianceKg=v;} public void setVariancePct(BigDecimal v){variancePct=v;} public void setRemarks(String v){remarks=v;} public void setCreatedAt(OffsetDateTime v){createdAt=v;} public void setCreatedBy(String v){createdBy=v;}
}
