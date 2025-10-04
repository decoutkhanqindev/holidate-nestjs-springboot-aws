package com.webapp.holidate.repository.policy;

import com.webapp.holidate.entity.policy.HotelPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HotelPolicyRepository extends JpaRepository<HotelPolicy, String> {
}