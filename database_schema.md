# Database Schema

This document outlines the database schema for the Lae Geomap Project.

## Table of Contents

- [CADASTRE (PARCEL)](#cadastre-parcel)
- [BUILDINGS](#buildings)
- [ZONING/VALUATION BLOCKS](#zoningvaluation-blocks)
- [OWNERS/CUSTOMERS (VALUATION ROLL)](#ownerscustomers-valuation-roll)
- [VALUATION ROLL](#valuation-roll)

---

## CADASTRE (PARCEL)

This table contains information about land parcels.

| Column Name      | Data Type | Description                                  |
| ---------------- | --------- | -------------------------------------------- |
| `parcel_id`      | `UUID`    | Primary key for the parcel.                  |
| `lot_number`     | `VARCHAR` | The official lot number of the parcel.       |
| `section`        | `VARCHAR` | The section where the parcel is located.     |
| `area`           | `DECIMAL` | The total area of the parcel in square meters.|
| `geometry`       | `GEOMETRY`| The spatial geometry of the parcel.          |
| `created_at`     | `TIMESTAMPTZ` | The timestamp when the record was created.   |
| `updated_at`     | `TIMESTAMPTZ` | The timestamp when the record was last updated.|

---

## BUILDINGS

This table stores information about buildings on the parcels.

| Column Name      | Data Type | Description                                  |
| ---------------- | --------- | -------------------------------------------- |
| `building_id`    | `UUID`    | Primary key for the building.                |
| `parcel_id`      | `UUID`    | Foreign key referencing the `CADASTRE` table.|
| `building_type`  | `VARCHAR` | The type of building (e.g., residential, commercial). |
| `floor_area`     | `DECIMAL` | The total floor area of the building.        |
| `year_built`     | `INTEGER` | The year the building was constructed.       |
| `geometry`       | `GEOMETRY`| The spatial geometry of the building footprint.|
| `created_at`     | `TIMESTAMPTZ` | The timestamp when the record was created.   |
| `updated_at`     | `TIMESTAMPTZ` | The timestamp when the record was last updated.|

---

## ZONING/VALUATION BLOCKS

This table defines zoning and valuation blocks.

| Column Name      | Data Type | Description                                  |
| ---------------- | --------- | -------------------------------------------- |
| `block_id`       | `UUID`    | Primary key for the block.                   |
| `block_name`     | `VARCHAR` | The name or identifier of the block.         |
| `zoning_code`    | `VARCHAR` | The zoning code for the block.               |
| `description`    | `TEXT`    | A description of the zoning regulations.     |
| `geometry`       | `GEOMETRY`| The spatial geometry of the block.           |
| `created_at`     | `TIMESTAMPTZ` | The timestamp when the record was created.   |
| `updated_at`     | `TIMESTAMPTZ` | The timestamp when the record was last updated.|

---

## OWNERS/CUSTOMERS (VALUATION ROLL)

This table contains information about property owners.

| Column Name      | Data Type | Description                                  |
| ---------------- | --------- | -------------------------------------------- |
| `owner_id`       | `UUID`    | Primary key for the owner.                   |
| `first_name`     | `VARCHAR` | The first name of the owner.                 |
| `last_name`      | `VARCHAR` | The last name of the owner.                  |
| `address`        | `VARCHAR` | The mailing address of the owner.            |
| `phone_number`   | `VARCHAR` | The contact phone number of the owner.       |
| `email`          | `VARCHAR` | The email address of the owner.              |
| `created_at`     | `TIMESTAMPTZ` | The timestamp when the record was created.   |
| `updated_at`     | `TIMESTAMPTZ` | The timestamp when the record was last updated.|

---

## OWNERS

This table contains information about property owners, including their contact details and lease information.

| Column Name      | Data Type | Description                                  |
| ---------------- | --------- | -------------------------------------------- |
| `owner_id`       | `TEXT`    | Primary key for the owner.                   |
| `owner_name`     | `TEXT`    | The full name of the owner.                  |
| `parcel_id`      | `TEXT`    | Foreign key referencing the `CADASTRE` table, unique per owner.|
| `contact_info`   | `TEXT`    | Contact information for the owner.           |
| `title_reference`| `TEXT`    | Reference to the property title.             |
| `term_of_lease`  | `TEXT`    | The term of the lease for the property.      |
| `date_of_grant`  | `DATE`    | The date the lease was granted.              |

---

## VALUATION ROLL

This table links parcels, owners, and valuation information.

| Column Name      | Data Type | Description                                  |
| ---------------- | --------- | -------------------------------------------- |
| `valuation_id`   | `UUID`    | Primary key for the valuation record.        |
| `parcel_id`      | `UUID`    | Foreign key referencing the `CADASTRE` table.|
| `owner_id`       | `UUID`    | Foreign key referencing the `OWNERS_CUSTOMERS` table.|
| `valuation_date` | `DATE`    | The date of the property valuation.          |
| `land_value`     | `DECIMAL` | The assessed value of the land.              |
| `improvement_value`| `DECIMAL` | The assessed value of the improvements (buildings).|
| `total_value`    | `DECIMAL` | The total assessed value of the property.    |
| `created_at`     | `TIMESTAMPTZ` | The timestamp when the record was created.   |
| `updated_at`     | `TIMESTAMPTZ` | The timestamp when the record was last updated.|












-- ====================================================================================
-- REVISED SCRIPT FOR: Web-Based GIS Asset Management System (Lae Urban Municipality)
-- TARGET PLATFORM: Supabase (PostgreSQL with PostGIS)
-- DESCRIPTION: This script creates tables, RLS policies, and sample data.
--              NOTE: Database roles and permissions must be created separately
--              using the Supabase Dashboard as per instructions.
-- ====================================================================================

-- PART 1: INITIAL DATABASE SETUP
-- ====================================================================================
-- Step 1.1: Enable the PostGIS extension for geospatial capabilities.
CREATE EXTENSION IF NOT EXISTS postgis;


-- ====================================================================================
-- PART 2: TABLE CREATION (Data Definition Language - DDL)
-- ====================================================================================
-- These tables are designed based on the project's data sources [3].

-- Step 2.1: Create an ENUM type for user roles to ensure data consistency.
CREATE TYPE public.user_role AS ENUM (
    'finance_editor',
    'planning_editor',
    'asset_editor',
    'client_user',
    'public_viewer'
);

-- Step 2.2: Create a 'profiles' table to store user-specific data and roles.
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    role public.user_role NOT NULL DEFAULT 'public_viewer',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
COMMENT ON TABLE public.profiles IS 'Stores public profile information for each user, including their specific role.';

-- Step 2.3: Create the main 'properties' table for building and land assets.
CREATE TABLE public.properties (
    property_id SERIAL PRIMARY KEY,
    owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    address TEXT NOT NULL,
    land_details TEXT, -- Derived from Valuation Roll (2015)
    building_details TEXT, -- Derived from Valuation Roll (2015)
    last_valuation_year INT,
    geom GEOMETRY(Polygon, 32755) -- SRID 32755 for WGS 84 / UTM Zone 55S [4]
);
COMMENT ON TABLE public.properties IS 'Core table for building and land assets, linking spatial and attribute data [5].';

-- Step 2.4: Create a spatial index on the geometry column for faster queries.
CREATE INDEX idx_properties_geom ON public.properties USING GIST (geom);

-- Step 2.5: Create the 'tax_records' table for finance and treasury data.
CREATE TABLE public.tax_records (
    tax_record_id SERIAL PRIMARY KEY,
    property_id INT NOT NULL REFERENCES public.properties(property_id) ON DELETE CASCADE,
    customer_name TEXT,
    tax_year INT NOT NULL,
    amount_due NUMERIC(12, 2),
    payment_status TEXT DEFAULT 'Unpaid' CHECK (payment_status IN ('Unpaid', 'Paid', 'Overdue')),
    record_date DATE DEFAULT CURRENT_DATE
);
COMMENT ON TABLE public.tax_records IS 'Stores financial data related to land tax for each property [3].';

-- Step 2.6: Create a 'planning_data' table for engineering and planning.
CREATE TABLE public.planning_data (
    planning_id SERIAL PRIMARY KEY,
    property_id INT NOT NULL REFERENCES public.properties(property_id) ON DELETE CASCADE,
    zoning_code TEXT,
    permit_status TEXT,
    last_updated_by TEXT,
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
COMMENT ON TABLE public.planning_data IS 'Stores engineering and planning datasets like zoning and building permits [6].';


-- ====================================================================================
-- PART 3: POPULATE TABLES WITH DEMO DATA
-- ====================================================================================
-- Inserts 10 sample properties in Lae City, Ward Two [7].
INSERT INTO public.properties (address, land_details, building_details, last_valuation_year, geom) VALUES
('101 Cassowary Road, Top Town', 'Section 1, Lot 2. Commercial Zone.', '2-story office building, concrete construction.', 2015, ST_SetSRID(ST_GeomFromText('POLYGON((475100 9250100, 475150 9250100, 475150 9250150, 475100 9250150, 475100 9250100))'), 32755)),
('23 Markham Road, Chinatown', 'Section 5, Lot 12. Mixed-use.', 'Retail shop on ground floor, residence above.', 2015, ST_SetSRID(ST_GeomFromText('POLYGON((476200 9249500, 476230 9249500, 476230 9249540, 476200 9249540, 476200 9249500))'), 32755)),
('Unit 5, Voco Point Industrial', 'Section 3, Lot 8. Industrial.', 'Large warehouse with loading bay.', 2015, ST_SetSRID(ST_GeomFromText('POLYGON((477500 9248200, 477600 9248200, 477600 9248300, 477500 9248300, 477500 9248200))'), 32755)),
('45 Hospital Road, near Angau', 'Section 2, Lot 21. Residential.', 'Single-family dwelling, timber frame.', 2015, ST_SetSRID(ST_GeomFromText('POLYGON((475800 9250500, 475840 9250500, 475840 9250530, 475800 9250530, 475800 9250500))'), 32755)),
('78 Coronation Drive, Top Town', 'Section 1, Lot 15. Commercial.', 'Bank branch, single story.', 2015, ST_SetSRID(ST_GeomFromText('POLYGON((475200 9250200, 475250 9250200, 475250 9250240, 475200 9250240, 475200 9250200))'), 32755)),
('Vacant Land, Chinatown Buffer Zone', 'Section 5, Lot 30. Buffer Zone.', 'No building. State land. Occupied by informal settlers.', 2015, ST_SetSRID(ST_GeomFromText('POLYGON((476300 9249600, 476350 9249600, 476350 9249650, 476300 9249650, 476300 9249600))'), 32755)),
('12 Milfordhaven Road, Voco Point', 'Section 3, Lot 4. Commercial/Wharf.', 'Shipping company office.', 2015, ST_SetSRID(ST_GeomFromText('POLYGON((477300 9248100, 477350 9248100, 477350 9248150, 477300 9248150, 477300 9248100))'), 32755)),
('5 Archer Street, Top Town', 'Section 1, Lot 9. Residential.', 'Apartment block, 3 stories.', 2015, ST_SetSRID(ST_GeomFromText('POLYGON((475050 9250300, 475100 9250300, 475100 9250350, 475050 9250350, 475050 9250300))'), 32755)),
('9 Huon Road, near Angau', 'Section 2, Lot 35. Commercial.', 'Small convenience store.', 2015, ST_SetSRID(ST_GeomFromText('POLYGON((475900 9250600, 475930 9250600, 475930 9250620, 475900 9250620, 475900 9250600))'), 32755)),
('33 Montoro Street, Chinatown', 'Section 5, Lot 18. Residential.', 'Duplex housing.', 2015, ST_SetSRID(ST_GeomFromText('POLYGON((476100 9249700, 476140 9249700, 476140 9249730, 476100 9249730, 476100 9249700))'), 32755));

INSERT INTO public.tax_records (property_id, customer_name, tax_year, amount_due, payment_status) VALUES
(1, 'Lae Business Corp.', 2017, 5500.00, 'Paid'),
(1, 'Lae Business Corp.', 2018, 5600.00, 'Unpaid'),
(2, 'Chinatown Retailers', 2017, 3200.50, 'Paid'),
(3, 'Voco Shipping Ltd.', 2018, 12500.00, 'Overdue'),
(4, 'John Doe', 2018, 1250.00, 'Paid'),
(5, 'National Bank', 2018, 7950.00, 'Paid'),
(8, 'Top Town Apartments', 2018, 4500.00, 'Unpaid');

INSERT INTO public.planning_data (property_id, zoning_code, permit_status, last_updated_by) VALUES
(1, 'C1-Commercial', 'Approved', 'planning_dept'),
(2, 'MXD-MixedUse', 'Approved', 'planning_dept'),
(6, 'BUF-BufferZone', 'Restricted', 'planning_dept');


-- ====================================================================================
-- PART 4: DATABASE SECURITY - ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================================
-- This section implements the detailed role-based access control [1, 2].

-- Step 4.1: Enable Row Level Security on all tables.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planning_data ENABLE ROW LEVEL SECURITY;

-- Step 4.2: Create policies for the 'properties' table.
-- Using a security definer function to get the user's role from their profile.
CREATE OR REPLACE FUNCTION get_my_role() RETURNS public.user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- Public can see all properties.
CREATE POLICY "Public viewers can see all properties" ON public.properties
FOR SELECT USING (true);
-- Asset editors have full control.
CREATE POLICY "Asset editors can manage all properties" ON public.properties
FOR ALL USING (get_my_role() = 'asset_editor');
-- Clients can only see properties linked to their user ID.
CREATE POLICY "Clients can view their own properties" ON public.properties
FOR SELECT USING (auth.uid() = owner_user_id);

-- Step 4.3: Create policies for 'tax_records'.
-- Finance editors have full control.
CREATE POLICY "Finance editors can manage all tax records" ON public.tax_records
FOR ALL USING (get_my_role() = 'finance_editor');
-- Clients can see tax records for properties they own.
CREATE POLICY "Clients can view their own tax records" ON public.tax_records
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.property_id = tax_records.property_id AND p.owner_user_id = auth.uid()
  )
);

-- Step 4.4: Create policies for 'planning_data'.
-- Planning editors have full control.
CREATE POLICY "Planning editors can manage all planning data" ON public.planning_data
FOR ALL USING (get_my_role() = 'planning_editor');
-- Allow all logged-in users to see planning data (optional, for transparency).
CREATE POLICY "Authenticated users can view planning data" ON public.planning_data
FOR SELECT USING (auth.role() = 'authenticated');


-- ====================================================================================
-- PART 5: GEOJSON DATA FUNCTION
-- ====================================================================================
-- This function demonstrates how to serve geospatial data from PostGIS to a web front-end [8, 9].
CREATE OR REPLACE FUNCTION get_all_properties_geojson()
RETURNS jsonb AS $$
BEGIN
    RETURN (
        SELECT jsonb_build_object(
            'type', 'FeatureCollection',
            'features', jsonb_agg(features.feature)
        )
        FROM (
            SELECT jsonb_build_object(
                'type', 'Feature',
                'id', p.property_id,
                'geometry', ST_AsGeoJSON(p.geom)::jsonb,
                'properties', to_jsonb(p) - 'geom' - 'owner_user_id'
            ) AS feature
            FROM public.properties AS p
        ) AS features
    );
END;
$$ LANGUAGE plpgsql;
