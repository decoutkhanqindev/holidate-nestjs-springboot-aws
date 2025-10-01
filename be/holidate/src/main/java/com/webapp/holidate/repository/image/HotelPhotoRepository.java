package com.webapp.holidate.repository.image;

import com.webapp.holidate.entity.image.HotelPhoto;
import com.webapp.holidate.entity.image.Photo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HotelPhotoRepository extends JpaRepository<HotelPhoto, String> {
}
