package com.roastingmonitor.repository;
import com.roastingmonitor.model.RawMaterial; import java.util.Optional; import org.springframework.data.jpa.repository.JpaRepository;
public interface RawMaterialRepository extends JpaRepository<RawMaterial,Long>{Optional<RawMaterial> findByNameIgnoreCase(String name);}
