package com.webapp.holidate.repository.image;

import com.webapp.holidate.entity.image.PhotoCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PhotoCategoryRepository extends JpaRepository<PhotoCategory, String> {
}
