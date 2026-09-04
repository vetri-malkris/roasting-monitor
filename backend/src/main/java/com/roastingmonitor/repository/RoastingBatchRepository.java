package com.roastingmonitor.repository;
import com.roastingmonitor.model.RoastingBatch; import java.util.*; import org.springframework.data.jpa.repository.JpaRepository;
public interface RoastingBatchRepository extends JpaRepository<RoastingBatch,Long>{List<RoastingBatch> findAllByOrderByCreatedAtDesc(); List<RoastingBatch> findTop10ByCreatedByOrderByCreatedAtDesc(String createdBy);}
