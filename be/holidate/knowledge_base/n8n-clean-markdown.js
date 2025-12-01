// N8N CODE NODE - Clean Markdown Optimized
// Tối ưu phần cleanedContent: loại bỏ ký tự rác, giữ nguyên nội dung ngữ nghĩa

for (const item of $input.all()) {
  const binaryData = item.binary;
  if (binaryData && binaryData.data) {
    
    // 1. ĐỌC FILE GỐC
    const rawContent = global.Buffer.from(binaryData.data.data, 'base64').toString('utf8');

    // 2. TRÍCH XUẤT METADATA TỪ YAML FRONTMATTER (25 trường cần thiết)
    const metadata = {};
    metadata.source = binaryData.data.fileName || "unknown";
    
    // Trích xuất YAML Frontmatter (giữa 2 dấu ---)
    const yamlMatch = rawContent.match(/^---\s*([\s\S]*?)\s*---/);
    const yamlContent = yamlMatch ? yamlMatch[1] : '';
    
    // Helper function để parse YAML value
    const parseYamlValue = (pattern, defaultValue = null) => {
      const match = yamlContent.match(pattern);
      if (!match) return defaultValue;
      const value = match[1].trim();
      // Xử lý boolean
      if (value === 'true') return true;
      if (value === 'false') return false;
      // Xử lý số
      if (/^\d+$/.test(value)) return parseInt(value, 10);
      if (/^\d+\.\d+$/.test(value)) return parseFloat(value);
      // Xử lý string (bỏ dấu ngoặc kép)
      return value.replace(/^["']|["']$/g, '');
    };
    
    const parseYamlArraySimple = (fieldName) => {
      // Tìm vị trí bắt đầu của field
      const fieldPattern = new RegExp(`^${fieldName}:\\s*$`, 'm');
      const fieldMatch = yamlContent.match(fieldPattern);
      if (!fieldMatch) return [];
      
      const startIndex = fieldMatch.index + fieldMatch[0].length;
      const remainingContent = yamlContent.substring(startIndex);
      const lines = remainingContent.split('\n');
      const items = [];
      
      // Parse từng dòng cho đến khi gặp field mới hoặc section mới
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Dừng khi gặp section mới (# ===) hoặc field mới (chữ cái thường + :)
        if (line.startsWith('# ===') || /^[a-z_]+:\s*$/.test(line)) {
          break;
        }
        
        // Bỏ qua dòng trống và comment đơn thuần
        if (!line || (line.startsWith('#') && !line.match(/^\s*-\s*"/))) {
          continue;
        }
        
        // Match pattern: - "value" (có thể có comment)
        const itemMatch = line.match(/^\s*-\s*"([^"]+)"/);
        if (itemMatch) {
          items.push(itemMatch[1]);
        }
      }
      
      return items;
    };
    
    // === TRÍCH XUẤT 25 TRƯỜNG CẦN THIẾT ===
    
    // === 1. IDENTITY ===
    // 1. source (đã set ở trên)
    
    // 2. doc_id
    metadata.doc_id = parseYamlValue(/doc_id:\s*"([^"]+)"/);
    
    // 3. doc_type
    metadata.doc_type = parseYamlValue(/doc_type:\s*"([^"]+)"/);
    
    // 4. hotel_id (fallback to parent_hotel_id)
    metadata.hotel_id = parseYamlValue(/hotel_id:\s*"([^"]+)"/) || 
                        parseYamlValue(/parent_hotel_id:\s*"([^"]+)"/);
    
    // 5. hotel_name (fallback logic từ content body nếu null)
    metadata.hotel_name = parseYamlValue(/location:\s*[\s\S]*?hotel_name:\s*"([^"]+)"/) || 
                         parseYamlValue(/hotel_name:\s*"([^"]+)"/);
    
    // === 2. LOCATION ===
    // 6. city_name (prefer city_name, fallback to city)
    metadata.city_name = parseYamlValue(/city_name:\s*"([^"]+)"/) || 
                         parseYamlValue(/location:\s*[\s\S]*?city_name:\s*"([^"]+)"/) ||
                         parseYamlValue(/location:\s*[\s\S]*?city:\s*"([^"]+)"/) || 
                         parseYamlValue(/city:\s*"([^"]+)"/);
    
    // 7. district_name (prefer district_name, fallback to district)
    metadata.district_name = parseYamlValue(/district_name:\s*"([^"]+)"/) || 
                              parseYamlValue(/location:\s*[\s\S]*?district_name:\s*"([^"]+)"/) ||
                              parseYamlValue(/location:\s*[\s\S]*?district:\s*"([^"]+)"/) || 
                              parseYamlValue(/district:\s*"([^"]+)"/);
    
    // 8. address (prefer full_address, fallback to address)
    metadata.address = parseYamlValue(/full_address:\s*"([^"]+)"/) || 
                       parseYamlValue(/location:\s*[\s\S]*?address:\s*"([^"]+)"/) || 
                       parseYamlValue(/address:\s*"([^"]+)"/);
    
    // === 3. STATS ===
    // 9. star_rating (parse as int)
    metadata.star_rating = parseYamlValue(/star_rating:\s*(\d+)/);
    if (metadata.star_rating !== null) {
      metadata.star_rating = parseInt(metadata.star_rating, 10);
    }
    
    // 10. review_score (parse as float)
    metadata.review_score = parseYamlValue(/review_score:\s*([\d.]+)/);
    if (metadata.review_score !== null) {
      metadata.review_score = parseFloat(metadata.review_score);
    }
    
    // 11. review_count (parse as int)
    metadata.review_count = parseYamlValue(/review_count:\s*(\d+)/);
    if (metadata.review_count !== null) {
      metadata.review_count = parseInt(metadata.review_count, 10);
    }
    
    // === 4. PRICE & PROPS ===
    // 12. price (base_price, fallback to reference_min_price, default 0)
    const basePrice = parseYamlValue(/base_price:\s*(\d+)/);
    const referenceMinPrice = parseYamlValue(/reference_min_price:\s*(\d+)/);
    metadata.price = basePrice || referenceMinPrice || 0;
    if (metadata.price !== null) {
      metadata.price = parseInt(metadata.price, 10);
    }
    
    // 13. amenities (combine amenity_tags AND room_amenity_tags into one array)
    const amenityTags = parseYamlArraySimple('amenity_tags');
    const roomAmenityTags = parseYamlArraySimple('room_amenity_tags');
    metadata.amenities = [...(amenityTags || []), ...(roomAmenityTags || [])];
    
    // 14. breakfast_included (boolean)
    metadata.breakfast_included = parseYamlValue(/breakfast_included:\s*(true|false)/);
    
    // === 5. ROOM DETAILS ===
    // 15. room_name
    metadata.room_name = parseYamlValue(/room_name:\s*"([^"]+)"/);
    
    // 16. max_adults (parse as int)
    metadata.max_adults = parseYamlValue(/max_adults:\s*(\d+)/);
    if (metadata.max_adults !== null) {
      metadata.max_adults = parseInt(metadata.max_adults, 10);
    }
    
    // 17. max_children (parse as int)
    metadata.max_children = parseYamlValue(/max_children:\s*(\d+)/);
    if (metadata.max_children !== null) {
      metadata.max_children = parseInt(metadata.max_children, 10);
    }
    
    // 18. view_type (check view first, then view_type, including nested specs)
    metadata.view_type = parseYamlValue(/view:\s*"([^"]+)"/);
    if (!metadata.view_type) {
      // Check nested specs.view_type first
      const specsViewTypeMatch = yamlContent.match(/^specs:\s*$/m);
      if (specsViewTypeMatch) {
        const specsStartIndex = specsViewTypeMatch.index + specsViewTypeMatch[0].length;
        const specsSection = yamlContent.substring(specsStartIndex);
        const nestedViewTypeMatch = specsSection.match(/^\s+view_type:\s*"([^"]+)"/m);
        if (nestedViewTypeMatch) {
          metadata.view_type = nestedViewTypeMatch[1];
        }
      }
      // Fallback to root level view_type if not found
      if (!metadata.view_type) {
        metadata.view_type = parseYamlValue(/view_type:\s*"([^"]+)"/);
      }
    }
    
    // 19. bed_type
    metadata.bed_type = parseYamlValue(/bed_type:\s*"([^"]+)"/);
    
    // 20. area_sqm (parse as float)
    metadata.area_sqm = parseYamlValue(/area_sqm:\s*([\d.]+)/);
    if (metadata.area_sqm !== null) {
      metadata.area_sqm = parseFloat(metadata.area_sqm);
    }
    
    // === 6. ADDITIONAL IMPORTANT FIELDS ===
    // 21. wifi_available (boolean)
    metadata.wifi_available = parseYamlValue(/wifi_available:\s*(true|false)/);
    
    // 22. smoking_allowed (boolean)
    metadata.smoking_allowed = parseYamlValue(/smoking_allowed:\s*(true|false)/);
    
    // 23. to_beach_meters (integer) - from distances.to_beach_meters
    const distancesBeachMatch = yamlContent.match(/distances:\s*[\s\S]*?to_beach_meters:\s*(\d+)/);
    if (distancesBeachMatch) {
      metadata.to_beach_meters = parseInt(distancesBeachMatch[1], 10);
    } else {
      metadata.to_beach_meters = parseYamlValue(/to_beach_meters:\s*(\d+)/);
    }
    
    // 24. room_type (string)
    metadata.room_type = parseYamlValue(/room_type:\s*"([^"]+)"/);
    
    // 25. has_balcony (boolean) - check nested specs.has_balcony first, then root level
    const specsHasBalconyMatch = yamlContent.match(/^specs:\s*$/m);
    if (specsHasBalconyMatch) {
      const specsStartIndex = specsHasBalconyMatch.index + specsHasBalconyMatch[0].length;
      const specsSection = yamlContent.substring(specsStartIndex);
      const nestedHasBalconyMatch = specsSection.match(/^\s+has_balcony:\s*(true|false)/m);
      if (nestedHasBalconyMatch) {
        metadata.has_balcony = nestedHasBalconyMatch[1] === 'true';
      }
    }
    // Fallback to root level has_balcony if not found in specs
    if (metadata.has_balcony === undefined) {
      const hasBalconyValue = parseYamlValue(/has_balcony:\s*(true|false)/);
      if (hasBalconyValue !== null) {
        metadata.has_balcony = hasBalconyValue;
      }
    }
    
    // Fallback: Trích xuất hotel_name từ content body nếu chưa có
    if (!metadata.hotel_name && !metadata.room_name) {
      const contentBody = rawContent.replace(/^---[\s\S]*?---\s*/, '');
      const titleMatch = contentBody.match(/^#\s*(?:🏨|🛏️|.*?)\s*(.+?)(?:\s*-)?$/m);
      if (titleMatch) {
        metadata.hotel_name = titleMatch[1].trim();
      }
    }

    // 3. XỬ LÝ LÀM SẠCH VĂN BẢN (TỐI ƯU)
    let text = rawContent;
    
    // --- 3.1: Loại bỏ khối rác lớn (gộp regex để tối ưu) ---
    text = text
      .replace(/^---[\s\S]*?---\s*/, '')           // Xóa YAML Frontmatter
      .replace(/^# ===.*$/gm, '')                    // Xóa Header trang trí
      .replace(/\{\{TOOL:.*?\}\}/g, '')              // Xóa code Tool
      .replace(/!\[.*?\]\([^)]*\)/g, '');           // Xóa ảnh Markdown
    
    // --- 3.2: Decode HTML Entities (tối ưu: gộp các pattern tương tự) ---
    text = text
      .replace(/&#10;/g, '\n')                       // Line feed
      .replace(/&#13;/g, '\n')                       // Carriage return -> newline
      .replace(/&#9;/g, ' ')                         // Tab -> space
      .replace(/&nbsp;|&#160;/g, ' ')                // Non-breaking space
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;|&apos;/g, "'")
      .replace(/<[^>]*>/g, '');                      // Xóa thẻ HTML
    
    // Decode HTML entities dạng số và hex (chỉ giữ ký tự hợp lệ)
    text = text
      .replace(/&#(\d+);/g, (_, code) => {
        const c = parseInt(code, 10);
        return (c === 10 || c === 13 || (c >= 32 && c <= 126) || c >= 160) 
          ? (c === 13 ? '\n' : String.fromCharCode(c)) : '';
      })
      .replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => {
        const c = parseInt(hex, 16);
        return (c === 10 || c === 13 || (c >= 32 && c <= 126) || c >= 160) 
          ? (c === 13 ? '\n' : String.fromCharCode(c)) : '';
      });
    
    // --- 3.3: Xóa định dạng Markdown (giữ text) - tối ưu regex ---
    text = text
      .replace(/^#+\s+/gm, '')                      // Xóa dấu # Header
      .replace(/\*\*([^*]+)\*\*/g, '$1')             // Xóa Bold **
      .replace(/\*([^*]+)\*/g, '$1')                 // Xóa Italic *
      .replace(/__([^_]+)__/g, '$1')                 // Xóa Bold __
      .replace(/^>\s*/gm, '')                        // Xóa Blockquote >
      .replace(/^\s*[-*+]\s+/gm, '')                 // Xóa dấu gạch đầu dòng list
      .replace(/`([^`]+)`/g, '$1');                  // Xóa inline code
    
    // --- 3.3.5: Loại bỏ các bảng trùng lặp (DUPLICATE TABLE REMOVAL) ---
    // Phát hiện và xóa các bảng bị duplicate, đặc biệt là bảng "📆 Thông Tin Theo Ngày"
    // Strategy: Phát hiện cả header emoji VÀ dòng header bảng (sau khi xóa markdown)
    // LƯU Ý: Header đã bị xóa markdown (#) ở bước 3.3, nên chỉ còn text thuần
    
    const tableLines = text.split('\n');
    const dedupedLines = [];
    const seenTableHeaders = new Set();
    const seenTableRowHeaders = new Set(); // Dòng header của bảng (không có emoji)
    let skipUntilNextHeader = false;
    let inTableSection = false;
    
    for (let i = 0; i < tableLines.length; i++) {
      const line = tableLines[i];
      const trimmed = line.trim();
      
      // Phát hiện header của bảng có emoji (SAU KHI ĐÃ XÓA MARKDOWN)
      const isTableHeaderEmoji = /^📆\s*Thông Tin Theo Ngày/.test(trimmed) ||
                                 /^💰\s*Giá\s*&\s*Tình Trạng Trong 7 Ngày Tới/.test(trimmed);
      
      // Phát hiện dòng header của bảng (không có emoji) - pattern phổ biến
      const isTableRowHeader = /^Ngày\s+Thứ\s+Giá\s*\(VNĐ/.test(trimmed) ||
                               /^Ngày\s+Thứ\s+Giá\s*\(VNĐ\/đêm\)/.test(trimmed) ||
                               (/^Ngày/.test(trimmed) && /Thứ/.test(trimmed) && /Giá/.test(trimmed));
      
      // Phát hiện dòng bảng (có chứa |) - QUAN TRỌNG: phải check TRƯỚC khi flatten
      const isTableRow = /\|/.test(line);
      
      // Phát hiện dòng dữ liệu bảng (có pattern ngày tháng: 2025-11-29, 2025-12-01, etc.)
      const isTableDataRow = /^\d{4}-\d{2}-\d{2}/.test(trimmed) && 
                            (/\bsaturday\b|\bsunday\b|\bmonday\b|\btuesday\b|\bwednesday\b|\bthursday\b|\bfriday\b/i.test(trimmed) ||
                             /\d+\.\d+\s+\d+/.test(trimmed)); // Pattern: giá số + số phòng
      
      // Phát hiện header mới (không phải bảng duplicate) - các emoji khác
      const isNewHeader = /^[🎯⭐🎁📋📍🛏️⏰✨👨|🏖️❌🔄💳📞📊📈📅🚭⚠️]/.test(trimmed) && 
                        !isTableHeaderEmoji;
      
      if (isTableHeaderEmoji) {
        // Header có emoji
        const tableKey = trimmed.replace(/\s+/g, ' ').trim();
        
        if (seenTableHeaders.has(tableKey)) {
          skipUntilNextHeader = true;
          inTableSection = true;
        } else {
          seenTableHeaders.add(tableKey);
          skipUntilNextHeader = false;
          inTableSection = true;
          dedupedLines.push(line);
        }
      } else if (isTableRowHeader) {
        // Dòng header của bảng (không có emoji) - đây là dấu hiệu bắt đầu bảng mới
        const rowHeaderKey = trimmed.replace(/\s+/g, ' ').trim();
        
        if (seenTableRowHeaders.has(rowHeaderKey)) {
          // Đã thấy dòng header này rồi = bảng duplicate
          skipUntilNextHeader = true;
          inTableSection = true;
        } else {
          // Dòng header mới
          seenTableRowHeaders.add(rowHeaderKey);
          skipUntilNextHeader = false;
          inTableSection = true;
          dedupedLines.push(line);
        }
      } else if (skipUntilNextHeader && inTableSection) {
        // Đang trong bảng duplicate, bỏ qua tất cả dòng cho đến khi gặp header mới hoặc nội dung không phải bảng
        if (isNewHeader) {
          // Gặp header mới (emoji khác), dừng skip
          skipUntilNextHeader = false;
          inTableSection = false;
          dedupedLines.push(line);
        } else if (isTableRowHeader) {
          // Gặp dòng header bảng mới (duplicate tiếp theo) - tiếp tục skip, không push
          // Không làm gì, tiếp tục skip
        } else if (!isTableDataRow && trimmed.length > 0 && !/^[\s-:|]+$/.test(trimmed)) {
          // Gặp nội dung không phải dữ liệu bảng (có text thực sự, không phải separator)
          // Kiểm tra xem dòng trước đó có phải là dữ liệu bảng không
          let prevIsTableData = false;
          for (let j = i - 1; j >= 0 && j >= i - 5; j--) {
            const prevLine = tableLines[j] || '';
            const prevTrimmed = prevLine.trim();
            if (prevTrimmed.length > 0) {
              prevIsTableData = /^\d{4}-\d{2}-\d{2}/.test(prevTrimmed);
              break;
            }
          }
          
          if (prevIsTableData) {
            // Dòng trước đó là dữ liệu bảng, đây là kết thúc bảng duplicate
            skipUntilNextHeader = false;
            inTableSection = false;
            dedupedLines.push(line);
          }
        }
        // Tất cả các dòng khác (dữ liệu bảng, dòng trống) đều bị skip - không push vào dedupedLines
      } else {
        // Không trong bảng duplicate, giữ nguyên
        if (inTableSection && !isTableRow && !isTableDataRow && trimmed.length > 0) {
          // Kết thúc section bảng nếu gặp nội dung không phải bảng
          inTableSection = false;
        }
        dedupedLines.push(line);
      }
    }
    
    text = dedupedLines.join('\n');
    
    // --- 3.4: Xử lý Bảng (Table Flattening) - tối ưu ---
    text = text
      .replace(/^\|?[\s-:|]+\|?$/gm, '')             // Xóa dòng kẻ bảng
      .replace(/\|/g, ' ');                           // Thay dấu | bằng space
    
    // --- 3.5: Xóa text rác cụ thể ---
    text = text
      .replace(/_Thông tin.*?cập nhật sớm\._/g, '')
      .replace(/_Hiện tại không có.*?_/g, '')
      .replace(/Disclaimer quan trọng/g, '')
      .replace(/\{\{.*?\}\}/g, '');                  // Xóa tất cả template variables còn sót
    
    // --- 3.6: Dọn dẹp cuối cùng (tối ưu thứ tự) ---
    text = text
      .replace(/\r\n|\r/g, '\n')                     // Chuẩn hóa line endings (quan trọng!)
      .replace(/[\u200B-\u200D\u2060\uFEFF]/g, '')   // Loại bỏ zero-width characters
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '') // Loại bỏ control chars
      .replace(/[\u2028\u2029]/g, '\n')              // Chuẩn hóa line separators
      .replace(/[\u2000-\u200A\u202F\u205F\u00A0]/g, ' ') // Chuẩn hóa space
      .replace(/[ \t]+/g, ' ')                       // Xóa khoảng trắng thừa (quan trọng!)
      .replace(/\n\s*\n\s*\n+/g, '\n\n')            // Tối đa 2 dòng trống
      .replace(/[ \t]+$/gm, '')                      // Xóa trailing whitespace
      .replace(/[\uFFFD\u00AD\0]/g, '')              // Loại bỏ replacement char, soft hyphen, null
      .trim();
    
    // --- 3.7: SEMANTIC CLEANING - Tối ưu cho Vector DB ---
    
    // 3.7.1: Sửa artifacts còn sót
    text = text
      .replace(/:\s*\}\s*$/gm, '')                   // Xóa dấu } còn sót ở cuối dòng
      .replace(/⚠️\s*:\s*$/gm, '⚠️ Disclaimer quan trọng:') // Sửa tiêu đề bị mất
      .replace(/⚠️\s*:\s*\n/g, '⚠️ Disclaimer quan trọng:\n'); // Sửa tiêu đề bị mất (trường hợp khác)
    
    // 3.7.2: Loại bỏ conversational fluff (kịch bản chatbot)
    text = text
      .replace(/📞\s*Liên Hệ\s*&\s*Hỗ Trợ[\s\S]*?Hãy cho tôi biết kế hoạch của bạn![\s\S]*$/g, '') // Xóa toàn bộ phần liên hệ
      .replace(/Bạn có câu hỏi về khách sạn này\?[\s\S]*?😊[\s\S]*$/g, '') // Xóa phần hỗ trợ
      .replace(/Tôi có thể giúp bạn:[\s\S]*?😊[\s\S]*$/g, '') // Xóa danh sách hỗ trợ
      .replace(/Hãy cho tôi biết[\s\S]*?😊[\s\S]*$/g, '') // Xóa câu kết thúc
      .replace(/Tôi sẽ kiểm tra ngay:[\s\S]*$/gm, '') // Xóa câu tool call
      .replace(/🔍\s*Để nhận báo giá chính xác cho ngày bạn muốn đi, hãy cho tôi biết:[\s\S]*?Tôi sẽ kiểm tra ngay\s*$/gm, ''); // Xóa đoạn disclaimer thừa
    
    // 3.7.3: Loại bỏ sections rỗng (tiêu đề không có nội dung)
    // Xóa các section rỗng cụ thể (pattern cụ thể - xử lý cả trường hợp không có dòng trống)
    text = text
      .replace(/✨\s*Tiện Nghi Nổi Bật\s*\n(?:\s*\n)?(?=[👨🛏️💰📋📍⏰⭐🎯❌🔄💳])/g, '') // Section rỗng - nhảy ngay sang header khác
      .replace(/⭐\s*Đánh Giá Khách Hàng\s*\n(?:\s*\n)?(?=[📋📍⏰🎯❌🔄💳])/g, '') // Section rỗng
      .replace(/❌\s*Chính Sách Hủy Phòng Chi Tiết\s*\n(?:\s*\n)?(?=[🔄💳📋📍⏰🎯])/g, '') // Section rỗng
      .replace(/🔄\s*Chính Sách Đổi Lịch Chi Tiết\s*\n(?:\s*\n)?(?=[💳📋📍⏰🎯])/g, '') // Section rỗng
      .replace(/🎯\s*Phù Hợp Với Ai\?\s*$/gm, '') // Section rỗng ở cuối file
      .replace(/🎯\s*Địa Điểm Giải Trí Gần Đây\s*\n(?:\s*\n)?(?=[⭐📋📍⏰🎯❌🔄💳])/g, '') // Section rỗng
      .replace(/🎁\s*Khuyến Mãi Đang Có\s*\n(?:\s*\n)?(?=[⭐📋📍⏰🎯❌🔄💳])/g, ''); // Section rỗng
    
    // Xóa pattern: Header + chỉ có dòng trống + Header mới (generic - cải thiện)
    const lines = text.split('\n');
    const cleanedLines = [];
    const headerPattern = /^[🎯⭐🎁📋📍🛏️💰⏰✨👨|🏖️❌🔄💳📞]/;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const isHeader = headerPattern.test(line);
      
      if (isHeader) {
        // Kiểm tra xem có nội dung sau header không
        let hasContent = false;
        let nextHeaderIndex = -1;
        
        // Tìm header tiếp theo hoặc nội dung thực sự
        for (let j = i + 1; j < lines.length && j < i + 6; j++) {
          const nextLine = lines[j].trim();
          
          // Nếu gặp header mới
          if (headerPattern.test(nextLine)) {
            nextHeaderIndex = j;
            break;
          }
          
          // Nếu có nội dung thực sự (không phải dòng trống, không phải chỉ có dấu câu)
          if (nextLine.length > 2 && !/^[:\-_\s]+$/.test(nextLine)) {
            hasContent = true;
            break;
          }
        }
        
        // Quyết định: giữ header nếu có nội dung, xóa nếu header ngay trước header khác
        if (hasContent) {
          cleanedLines.push(lines[i]);
        } else if (nextHeaderIndex === i + 1) {
          // Header ngay trước header khác (không có dòng trống) = section rỗng, bỏ qua
        } else if (nextHeaderIndex > 0 && nextHeaderIndex < i + 4) {
          // Header trước header khác sau 1-3 dòng trống = section rỗng, bỏ qua
        } else if (i === lines.length - 1) {
          // Header ở cuối file mà không có nội dung = xóa
        } else {
          // Trường hợp khác, giữ lại để an toàn
          cleanedLines.push(lines[i]);
        }
      } else {
        cleanedLines.push(lines[i]);
      }
    }
    
    text = cleanedLines.join('\n');
    
    // 3.7.4: Dọn dẹp lại sau khi xóa sections
    text = text
      .replace(/\n{3,}/g, '\n\n')                     // Tối đa 2 dòng trống
      .replace(/^\s+|\s+$/gm, '')                     // Xóa leading/trailing whitespace mỗi dòng
      .trim();

    // 4. GHI DỮ LIỆU RA
    item.json.cleanedContent = text;
    item.json.metadata = metadata;
    item.binary = undefined;
  }
}

return $input.all();

/*
 * ============================================================
 * HƯỚNG DẪN SỬ DỤNG METADATA VỚI PINECONE VECTOR DB
 * ============================================================
 * 
 * Metadata đã được trích xuất từ YAML Frontmatter và sẵn sàng cho Pinecone filtering.
 * 
 * CẤU HÌNH DATA LOADER (Pinecone):
 * 
 * 1. Metadata Fields cho Filtering:
 *    - doc_type: "hotel_profile" | "room_detail"
 *    - doc_id, hotel_id, room_id: UUID strings
 *    - location: country, city, district (strings)
 *    - star_rating: integer (1-5)
 *    - reference_min_price, base_price: integer (VNĐ)
 *    - amenity_tags, location_tags, vibe_tags: arrays of strings
 *    - distances: to_beach_meters, to_city_center_meters (integers)
 *    - policies: breakfast_included, smoking_allowed (booleans)
 * 
 * 2. Ví dụ Query với Metadata Filtering:
 * 
 *    // Tìm khách sạn có bể bơi tại Nha Trang
 *    filter = {
 *      doc_type: "hotel_profile",
 *      city: "thanh-pho-nha-trang",
 *      amenity_tags: { $in: ["swimming_pool", "pool"] }
 *    }
 * 
 *    // Tìm phòng giá dưới 1 triệu tại Golden Hotel
 *    filter = {
 *      doc_type: "room_detail",
 *      parent_hotel_id: "4b2d0a2d-cc1f-4030-8c07-5fa09b8229cf",
 *      base_price: { $lt: 1000000 }
 *    }
 * 
 *    // Tìm khách sạn 4-5 sao gần biển (< 500m)
 *    filter = {
 *      doc_type: "hotel_profile",
 *      star_rating: { $gte: 4 },
 *      to_beach_meters: { $lt: 500 }
 *    }
 * 
 * 3. Cấu trúc Metadata trong Pinecone:
 *    {
 *      id: metadata.doc_id,
 *      values: [vector embeddings],
 *      metadata: {
 *        doc_type: metadata.doc_type,
 *        hotel_id: metadata.hotel_id,
 *        city: metadata.city,
 *        star_rating: metadata.star_rating,
 *        reference_min_price: metadata.reference_min_price,
 *        amenity_tags: metadata.amenity_tags,  // Array
 *        // ... các trường khác
 *      }
 *    }
 * 
 * 4. Lưu ý:
 *    - Arrays (amenity_tags, location_tags) cần được filter bằng $in operator
 *    - Numbers (price, distance) dùng $lt, $lte, $gt, $gte
 *    - Booleans dùng exact match
 *    - Strings dùng exact match hoặc $in cho multiple values
 */

