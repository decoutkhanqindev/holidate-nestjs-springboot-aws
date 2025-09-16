package com.webapp.holidate.constants.db;

public class AuthQueries {
  public static final String FIND_USER_AUTH_INFO_BY_USER_EMAIL =
    "SELECT a FROM UserAuthInfo a JOIN FETCH a.user WHERE a.user.email = :email";
}
