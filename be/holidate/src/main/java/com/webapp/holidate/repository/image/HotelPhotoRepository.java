package com.webapp.holidate.repository.image;

import com.webapp.holidate.entity.image.HotelPhoto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HotelPhotoRepository extends JpaRepository<HotelPhoto, String> {
  boolean existsByPhotoId(String photoId);
}
