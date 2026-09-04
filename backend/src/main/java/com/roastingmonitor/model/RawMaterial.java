package com.roastingmonitor.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity @Table(name="raw_materials")
public class RawMaterial {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
  @Column(nullable=false, unique=true) private String name;
  @Column(nullable=false, precision=12, scale=2) private BigDecimal quantity;
  @Column(nullable=false, precision=5, scale=2) private BigDecimal standardLossPct;
  private String batchNumber; private String supplier;
  public RawMaterial() {}
  public RawMaterial(String name,BigDecimal quantity,BigDecimal standardLossPct){this.name=name;this.quantity=quantity;this.standardLossPct=standardLossPct;}
  public Long getId(){return id;} public String getName(){return name;} public BigDecimal getQuantity(){return quantity;} public BigDecimal getStandardLossPct(){return standardLossPct;} public String getBatchNumber(){return batchNumber;} public String getSupplier(){return supplier;}
  public void setName(String v){name=v;} public void setQuantity(BigDecimal v){quantity=v;} public void setStandardLossPct(BigDecimal v){standardLossPct=v;} public void setBatchNumber(String v){batchNumber=v;} public void setSupplier(String v){supplier=v;}
}
