package com.webapp.holidate.constants.api.param;

public class DashboardParams {
  // Partner dashboard parameters
  public static final String FORECAST_DAYS = "forecast-days";
  
  // Shared parameters
  public static final String HOTEL_ID = "hotel-id";
  
  // Default values
  public static final String DEFAULT_FORECAST_DAYS = "7";
  
  // Validation constraints
  public static final int MIN_FORECAST_DAYS = 1;
  public static final int MAX_FORECAST_DAYS = 30;
}

