package com.webapp.holidate.repository.image;

import com.webapp.holidate.entity.image.Photo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PhotoRepository extends JpaRepository<Photo, String> {
}
