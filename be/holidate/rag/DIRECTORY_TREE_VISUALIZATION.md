# Knowledge Base Directory Tree Visualization

## 📁 Complete Structure (Example with Real Data)

```
knowledge_base/
│
├── README.md
├── CHANGELOG.md
├── .gitignore
│
├── metadata/
│   ├── schema.json                             # JSON Schema validator
│   ├── vibe_mapping.yaml                       # Vibe inference rules
│   ├── amenity_en_vi_mapping.json             # Amenity translation map
│   └── location_aliases.json                   # Alternative location names
│
├── vietnam/                                     # Country level
│   │
│   ├── _country_overview.md                    # Vietnam tourism overview
│   │
│   ├── da-nang/                                # City: Đà Nẵng
│   │   ├── _city_guide.md                      # Đà Nẵng destination guide
│   │   │
│   │   ├── son-tra/                            # Quận Sơn Trà
│   │   │   ├── _district_overview.md
│   │   │   │
│   │   │   ├── hotels/
│   │   │   │   ├── grand-mercure-danang.md            # Hotel profile
│   │   │   │   ├── pullman-danang-beach-resort.md
│   │   │   │   ├── furama-resort-danang.md
│   │   │   │   ├── vinpearl-resort-spa-danang.md
│   │   │   │   └── hyatt-regency-danang.md
│   │   │   │
│   │   │   └── rooms/                          # Room details (if separate files)
│   │   │       ├── grand-mercure-danang/
│   │   │       │   ├── superior-garden-view.md
│   │   │       │   ├── deluxe-ocean-view.md
│   │   │       │   ├── premium-suite.md
│   │   │       │   └── executive-suite-premier.md
│   │   │       │
│   │   │       ├── pullman-danang-beach-resort/
│   │   │       │   ├── deluxe-pool-view.md
│   │   │       │   ├── suite-ocean-front.md
│   │   │       │   └── ...
│   │   │       │
│   │   │       └── ...
│   │   │
│   │   ├── hai-chau/                           # Quận Hải Châu
│   │   │   ├── _district_overview.md
│   │   │   │
│   │   │   └── hotels/
│   │   │       ├── novotel-danang-premier-han-river.md
│   │   │       ├── brilliant-hotel-danang.md
│   │   │       ├── vanda-hotel-danang.md
│   │   │       └── ...
│   │   │
│   │   ├── ngu-hanh-son/                       # Quận Ngũ Hành Sơn
│   │   │   └── hotels/
│   │   │       ├── vinpearl-resort-marble-mountains.md
│   │   │       ├── premier-village-danang.md
│   │   │       └── ...
│   │   │
│   │   ├── thanh-khe/                          # Quận Thanh Khê
│   │   │   └── hotels/
│   │   │       └── ...
│   │   │
│   │   └── cam-le/                             # Quận Cẩm Lệ
│   │       └── hotels/
│   │           └── ...
│   │
│   ├── nha-trang/                              # City: Nha Trang
│   │   ├── _city_guide.md
│   │   │
│   │   └── nha-trang-city/                     # Thành phố Nha Trang
│   │       ├── hotels/
│   │       │   ├── sheraton-nha-trang.md
│   │       │   ├── mia-resort-nha-trang.md
│   │       │   ├── vinpearl-luxury-nha-trang.md
│   │       │   ├── amiana-resort-nha-trang.md
│   │       │   └── ...
│   │       │
│   │       └── rooms/
│   │           └── ...
│   │
│   ├── phan-thiet/                             # City: Phan Thiết
│   │   ├── _city_guide.md
│   │   │
│   │   └── phan-thiet-city/
│   │       └── hotels/
│   │           ├── anantara-mui-ne-resort.md
│   │           ├── victoria-phan-thiet.md
│   │           └── ...
│   │
│   ├── vung-tau/                               # City: Vũng Tàu
│   │   ├── _city_guide.md
│   │   │
│   │   └── vung-tau-city/
│   │       └── hotels/
│   │           └── ...
│   │
│   ├── ho-chi-minh/                            # City: TP Hồ Chí Minh
│   │   ├── _city_guide.md
│   │   │
│   │   ├── quan-1/                             # Quận 1
│   │   │   └── hotels/
│   │   │       ├── park-hyatt-saigon.md
│   │   │       ├── caravelle-saigon.md
│   │   │       └── ...
│   │   │
│   │   ├── quan-3/                             # Quận 3
│   │   │   └── hotels/
│   │   │       └── ...
│   │   │
│   │   ├── quan-5/                             # Quận 5
│   │   ├── quan-7/                             # Quận 7
│   │   ├── quan-10/                            # Quận 10
│   │   ├── tan-binh/                           # Quận Tân Bình
│   │   │
│   │   └── thanh-pho-thu-duc/                  # TP Thủ Đức
│   │       └── hotels/
│   │           └── ...
│   │
│   ├── ha-noi/                                 # City: Hà Nội
│   │   ├── _city_guide.md
│   │   │
│   │   ├── hoan-kiem/                          # Quận Hoàn Kiếm
│   │   │   └── hotels/
│   │   │       ├── sofitel-legend-metropole.md
│   │   │       └── ...
│   │   │
│   │   ├── ba-dinh/                            # Quận Ba Đình
│   │   ├── tay-ho/                             # Quận Tây Hồ
│   │   ├── cau-giay/                           # Quận Cầu Giấy
│   │   ├── hai-ba-trung/                       # Quận Hai Bà Trưng
│   │   │
│   │   └── nam-tu-liem/                        # Quận Nam Từ Liêm
│   │       └── hotels/
│   │           └── ...
│   │
│   ├── hue/                                    # City: Huế
│   │   ├── _city_guide.md
│   │   │
│   │   └── thanh-pho-hue/
│   │       └── hotels/
│   │           └── ...
│   │
│   ├── vinh/                                   # City: Vinh
│   │   └── thanh-pho-vinh/
│   │       └── hotels/
│   │           └── ...
│   │
│   └── ha-tinh/                                # City: Hà Tĩnh
│       └── thanh-pho-ha-tinh/
│           └── hotels/
│               └── ...
│
├── collections/                                 # Curated thematic lists
│   ├── romantic-getaways.md                    # Top romantic hotels across VN
│   ├── family-friendly-resorts.md              # Best for families
│   ├── budget-stays-under-1m.md                # Budget-friendly options
│   ├── luxury-5star-escapes.md                 # Premium luxury properties
│   ├── beachfront-properties.md                # All beachfront hotels
│   ├── mountain-retreats.md                    # Mountain/hill resorts
│   ├── business-hotels.md                      # Business traveler friendly
│   ├── spa-wellness-resorts.md                 # Spa & wellness focus
│   ├── honeymoon-destinations.md               # Honeymoon packages
│   └── pet-friendly-hotels.md                  # Allow pets
│
├── faqs/                                        # Common questions
│   ├── booking-policies.md                     # How to book, payment, etc.
│   ├── cancellation-guide.md                   # Cancellation rules explained
│   ├── payment-methods.md                      # Accepted payment methods
│   ├── room-types-explained.md                 # What is Superior vs Deluxe?
│   ├── hotel-amenities-glossary.md             # What each amenity means
│   ├── vietnam-travel-tips.md                  # General travel advice
│   └── seasonal-pricing-guide.md               # When is peak season?
│
└── _archive/                                    # Deprecated/old versions
    └── 2025-Q3/
        └── ...

```

---

## 📊 Statistics (Example for 1000 Hotels)

```
Total Files:           ~5,000 files
├── Hotel Profiles:    1,000 files
├── Room Details:      3,500 files (avg 3.5 rooms/hotel)
├── City Guides:       9 files
├── Collections:       10 files
└── FAQs:              7 files

Total Size:            ~40 MB
├── Hotel Profiles:    8 MB (avg 8KB/file)
├── Room Details:      10.5 MB (avg 3KB/file)
├── Images (S3 URLs):  N/A (external references)
└── Metadata:          < 1 MB

Update Frequency:
├── Hotel Profiles:    Weekly (full), Hourly (incremental)
├── Room Details:      Weekly (full), Hourly (incremental)
├── City Guides:       Quarterly
├── Collections:       Monthly
└── FAQs:              As needed (manual)
```

---

## 🔍 File Naming Conventions

### Hotels
```
{hotel-name-slugified}.md

Examples:
✅ grand-mercure-danang.md
✅ pullman-danang-beach-resort.md
✅ vinpearl-resort-spa-danang.md
✅ khach-san-brilliant.md           # Vietnamese name transliterated

❌ Grand Mercure Danang.md          # No spaces
❌ grand_mercure_danang.md          # Use hyphens, not underscores
❌ GrandMercureDanang.md            # Not CamelCase
```

### Rooms
```
{room-name-slugified}.md

Examples:
✅ deluxe-ocean-view.md
✅ superior-garden-view.md
✅ executive-suite-premier.md
```

### Locations
```
{location-name-slugified}/

Examples:
✅ da-nang/                         # Đà Nẵng
✅ ho-chi-minh/                     # TP Hồ Chí Minh
✅ son-tra/                         # Quận Sơn Trà
✅ thanh-pho-thu-duc/               # TP Thủ Đức (7 words → hyphenated)
```

---

## 📂 Directory Naming Rules

### Rule 1: Lowercase Only
```
✅ nha-trang/
❌ Nha-Trang/
❌ NhaTrang/
```

### Rule 2: Remove Vietnamese Accents
```
Đà Nẵng     → da-nang
Hồ Chí Minh → ho-chi-minh
Ngũ Hành Sơn → ngu-hanh-son
```

### Rule 3: Replace Spaces with Hyphens
```
Thành phố Đà Nẵng → thanh-pho-da-nang → da-nang (shorthand)
```

### Rule 4: Remove Prefixes (When Clear)
```
"Thành phố Đà Nẵng"  → da-nang/        (not thanh-pho-da-nang/)
"Quận Sơn Trà"       → son-tra/        (not quan-son-tra/)
"Phường Thọ Quang"   → tho-quang/      (not phuong-tho-quang/)

BUT keep prefix when ambiguous:
"Thành phố Thủ Đức"  → thanh-pho-thu-duc/  (to distinguish from Quận Thủ Đức)
```

---

## 🗺️ Alternative Structure: Flat vs Hierarchical

### Current: Hierarchical (Recommended)
```
vietnam/da-nang/son-tra/hotels/grand-mercure.md
```
**Pros**:
- Natural geographic filtering
- Easy to browse manually
- Scales well with many hotels

**Cons**:
- Deeper directory nesting
- More complex path resolution

### Alternative: Flat with Tags
```
hotels/grand-mercure-danang.md  # All hotels in one folder
```
**Pros**:
- Simple structure
- Fast file lookup by slug

**Cons**:
- Loses geographic context
- Harder to browse manually
- Relies heavily on metadata filtering

**Verdict**: **Hierarchical is better** for this use case because:
1. Users often search by location ("hotels in Da Nang")
2. Allows efficient pre-filtering before vector search
3. Better for human maintenance

---

## 📍 Location Hierarchy Mapping

### Database Structure:
```
Country (1)
  └─ Province (N)
      └─ City (N)
          └─ District (N)
              └─ Ward (N)
                  └─ Street (N)
                      └─ Hotel (N)
```

### File System Structure:
```
vietnam/
  └─ {city-slug}/
      └─ {district-slug}/
          └─ hotels/
              └─ {hotel-slug}.md
```

**Why skip Province & Ward?**
- **Province**: Often redundant with City (e.g., "Đà Nẵng" is both province and city)
- **Ward**: Too granular for search (users rarely filter by ward)
- **Street**: Not useful for directory structure (included in hotel address field)

**Exception**: When Province ≠ City
```
vietnam/khanh-hoa/nha-trang/nha-trang-city/hotels/...
                  ^         ^
                  Province  City
```

---

## 🏷️ Special File Types

### City Guides (`_city_guide.md`)
**Purpose**: Overview of a destination (attractions, climate, best time to visit)

**Location**: `vietnam/{city}/_city_guide.md`

**Metadata**:
```yaml
doc_type: "destination_guide"
location_level: "city"
city: "da-nang"
```

### District Overviews (`_district_overview.md`)
**Purpose**: Brief intro to a district (character, main areas, what it's known for)

**Location**: `vietnam/{city}/{district}/_district_overview.md`

### Collections (`collections/*.md`)
**Purpose**: Curated lists spanning multiple cities/hotels

**Example**: `collections/romantic-getaways.md`
```yaml
doc_type: "collection"
theme: "romantic"
hotels:
  - grand-mercure-danang
  - pullman-danang-beach-resort
  - mia-resort-nha-trang
```

---

## 🔄 Update Workflow

### Scenario 1: Hotel Data Changed
```
1. Hotel partner updates description in admin panel
2. Trigger event: HotelUpdatedEvent
3. KBUpdateService:
   a. Fetch updated HotelKB DTO
   b. Regenerate hotel profile .md file
   c. Update vector DB embedding
4. File timestamp updated
```

### Scenario 2: New Hotel Added
```
1. Admin approves new hotel
2. Trigger event: HotelApprovedEvent
3. KBGenerationService:
   a. Generate hotel profile
   b. Generate all room details
   c. Create directory if needed
   d. Index all files in vector DB
```

### Scenario 3: Hotel Deleted/Deactivated
```
1. Hotel status → inactive
2. Trigger event: HotelDeactivatedEvent
3. KBCleanupService:
   a. Delete hotel profile .md
   b. Delete all room detail .md files
   c. Remove from vector DB
   d. Move to _archive/ (optional)
```

---

## 📈 Scalability Considerations

### Storage
- **1,000 hotels** → 40 MB
- **10,000 hotels** → 400 MB
- **100,000 hotels** → 4 GB

### File System Performance
- **Ext4/XFS**: No issues up to 100K+ files per directory
- **S3**: Effectively unlimited, but use directory structure for organization

### Vector DB Size
- **1,000 hotels** × 1.5KB embedding → 1.5 MB
- **10,000 hotels** × 1.5KB embedding → 15 MB
- **Metadata**: ~0.5KB/hotel → 5 MB for 10K hotels

**Conclusion**: File-based approach scales well up to 50K+ hotels.

---

## 🛠️ Maintenance Scripts

### Check for Orphaned Files
```bash
# Find .md files without corresponding hotel_id in database
find knowledge_base/vietnam -name "*.md" | while read file; do
  doc_id=$(yq '.doc_id' "$file")
  if ! curl -s "http://localhost:8080/api/v1/hotels/$doc_id" > /dev/null; then
    echo "Orphaned: $file"
  fi
done
```

### Validate Frontmatter
```bash
# Check all .md files have valid YAML frontmatter
find knowledge_base/vietnam -name "*.md" -exec python validate_frontmatter.py {} \;
```

### Generate Directory Tree
```bash
tree -L 5 -I '_archive|node_modules' knowledge_base/ > DIRECTORY_TREE.txt
```

---

This visualization should help understand the complete structure and organization philosophy of the Knowledge Base! 🎯

