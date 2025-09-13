package com.webapp.holidate.constants.db;

public class AuthQueries {
  public static final String FIND_USER_AUTH_INFO_BY_USER_EMAIL =
    "SELECT uai FROM  UserAuthInfo uai WHERE uai.user.email = :email";
}
