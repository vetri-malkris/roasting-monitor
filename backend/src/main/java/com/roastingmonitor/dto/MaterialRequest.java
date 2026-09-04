package com.roastingmonitor.dto;
import jakarta.validation.constraints.*; import java.math.BigDecimal;
public record MaterialRequest(@NotBlank String name,@NotNull @DecimalMin("0") BigDecimal quantity,@NotNull @DecimalMin("0") @DecimalMax("100") BigDecimal standardLossPct,String batchNumber,String supplier) {}
