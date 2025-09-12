package com.webapp.holidate.constants.db;

public class AuthQueries {
  public static final String FIND_USER_AUTH_INFO_BY_EMAIL =
      "SELECT uai FROM" + DbTableNames.USER_AUTH_INFO + "uai WHERE uai.user.email = :email";
}
