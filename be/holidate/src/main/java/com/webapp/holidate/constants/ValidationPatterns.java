package com.webapp.holidate.constants;

public class ValidationPatterns {
  public static final String PHONE_NUMBER = "^(\\+84|0)[0-9]{9,10}$";
  public static final String GENDER = "^(male|female|other)$";
  public static final String AUTH_PROVIDER = "^(local|google)$";
  public static final String ACCOMMODATION_STATUS = "^(active|inactive|maintenance|closed)$";
  public static final String DATE_UTC = "^\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\dZ$";
  public static final String LATITUDE_MIN = "-90.0";
  public static final String LATITUDE_MAX = "90.0";
  public static final String LONGITUDE_MIN = "-180.0";
  public static final String LONGITUDE_MAX = "180.0";
  public static final String CHECK_IN_OUT_TIME = "HH:mm";
}
