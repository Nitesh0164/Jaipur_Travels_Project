package com.example.jaipurtravel.service;

import com.example.jaipurtravel.dto.response.WeatherResponse;
import com.example.jaipurtravel.dto.response.WeatherTravelAdviceResponse;

public interface WeatherService {
    WeatherResponse getCurrentWeather(String city);
    WeatherResponse getForecast(String city);
    WeatherTravelAdviceResponse getTravelAdvice(String city);
    /** Lightweight summary for chat context. */
    String getWeatherSummary(String city);
}
