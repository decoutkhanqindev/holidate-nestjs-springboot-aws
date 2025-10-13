package com.webapp.holidate.mapper.location.entertainment_venue;

import com.webapp.holidate.dto.response.image.PhotoResponse;
import com.webapp.holidate.dto.response.location.entertainment_venue.EntertainmentVenueResponse;
import com.webapp.holidate.entity.image.HotelPhoto;
import com.webapp.holidate.entity.image.Photo;
import com.webapp.holidate.entity.location.entertainment_venue.EntertainmentVenue;
import com.webapp.holidate.entity.location.entertainment_venue.HotelEntertainmentVenue;
import com.webapp.holidate.mapper.image.PhotoCategoryMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = { EntertainmentVenueCategoryMapper.class })
public interface EntertainmentVenueMapper {
  @Mapping(source = "entertainmentVenue.id", target = "id")
  @Mapping(source = "entertainmentVenue.name", target = "name")
  EntertainmentVenueResponse toEntertainmentVenueResponse(HotelEntertainmentVenue entertainmentVenue);

  EntertainmentVenueResponse toEntertainmentVenueResponse(EntertainmentVenue entertainmentVenue);
}
