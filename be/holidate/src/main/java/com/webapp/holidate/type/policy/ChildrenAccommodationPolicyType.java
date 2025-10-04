package com.webapp.holidate.type.policy;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Getter
public enum ChildrenAccommodationPolicyType {
  FREE_SHARE_BED("free_share_bed"),
  EXTRA_FEE_REQUIRED_BED("extra_fee_required_bed"),
  CONSIDERED_ADULT("considered_adult");

  String value;
}
