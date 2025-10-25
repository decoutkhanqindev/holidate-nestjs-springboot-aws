-- Add createdAt and updatedAt columns to discounts table
ALTER TABLE discounts 
ADD COLUMN created_at TIMESTAMP NULL,
ADD COLUMN updated_at TIMESTAMP NULL;

-- Update existing records with current timestamp
UPDATE discounts 
SET created_at = NOW(), updated_at = NOW() 
WHERE created_at IS NULL;

-- Make created_at NOT NULL after updating existing records
ALTER TABLE discounts 
MODIFY COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Set default value for updated_at
ALTER TABLE discounts 
MODIFY COLUMN updated_at TIMESTAMP NULL DEFAULT NULL;
