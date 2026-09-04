package com.roastingmonitor.dto;
import jakarta.validation.constraints.*; import java.math.BigDecimal;
public record BatchRequest(@NotBlank String material,@NotNull @DecimalMin("0.01") BigDecimal inputQty,@NotNull @DecimalMin("0") BigDecimal outputQty,String remarks) {}
