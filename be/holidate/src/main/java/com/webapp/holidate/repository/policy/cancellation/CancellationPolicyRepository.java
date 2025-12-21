package com.webapp.holidate.repository.policy.cancellation;

import com.webapp.holidate.entity.policy.cancelation.CancellationPolicy;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CancellationPolicyRepository extends JpaRepository<CancellationPolicy, String> {
}
