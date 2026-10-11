# SnapShare System Scaling Plan

This document outlines the architectural scaling strategy and capacity planning for **SnapShare**, a high-scale photo-sharing platform.

---

## 1. System Assumptions & Estimates

### Baseline Facts
* **Registered Users:** 10,000,000 (10M)
* **Daily Active Users (DAU):** 10% of 10M = **1,000,000 (1M) DAU**
* **User Activity:**
  * 1 photo upload per DAU / day
  * 50 feed views per DAU / day
* **File Sizes:**
  * Original photo: 2 MB
  * Thumbnail photo: 50 KB (0.05 MB)
  * Total storage per photo entry: 2.05 MB

---

### Traffic Calculations

#### Uploads per Second
* **Total Daily Uploads:** $1,000,000 \text{ photos/day}$
* **Average Uploads/sec:**
  $$\frac{1,000,000 \text{ uploads}}{86,400 \text{ seconds}} \approx 11.57 \text{ uploads/sec}$$
* **Peak Uploads/sec (5x multiplier):**
  $$11.57 \times 5 \approx \mathbf{57.85 \text{ uploads/sec}}$$

#### Feed Views per Second
* **Total Daily Feed Views:** $1,000,000 \text{ DAU} \times 50 \text{ views} = 50,000,000 \text{ views/day}$
* **Average Feed Views/sec:**
  $$\frac{50,000,000 \text{ views}}{86,400 \text{ seconds}} \approx 578.7 \text{ views/sec}$$
* **Peak Feed Views/sec (5x multiplier):**
  $$578.7 \times 5 \approx \mathbf{2,893.5 \text{ views/sec}}$$

---

### Storage Calculations (Per Year)

* **Daily Raw Upload Storage:**
  $$1,000,000 \times 2 \text{ MB} = 2,000,000 \text{ MB} = 2 \text{ TB/day}$$
* **Daily Thumbnail Storage:**
  $$1,000,000 \times 0.05 \text{ MB} = 50,000 \text{ MB} = 0.05 \text{ TB/day}$$
* **Total Daily Media Storage:** $2.05 \text{ TB/day}$
* **Total Annual Storage:**
  $$2.05 \text{ TB/day} \times 365 \text{ days} = \mathbf{748.25 \text{ TB/year}}$$

---

## 2. Workload Characteristics & Storage Decision

### System Type: Read-Heavy
SnapShare is a **read-heavy** system with a read-to-write ratio of **50:1** (50 million feed reads vs. 1 million photo uploads daily).

* **Architectural Implication:** System design must heavily prioritize aggressive caching (CDN and in-memory caches), database read replicas, and asynchronous background processing so write operations never degrade read performance.

### Why Photos Should NOT Be Stored in the Database
Binary Blob files (like 2 MB JPEGs) should **never** be stored directly inside relational databases. Storing large binary objects bloats database indexes, exhausts RAM cache capacity, degrades backup/restore operations, and makes database scaling prohibitively expensive. 

Instead, photo files belong in **Distributed Object Storage** (such as AWS S3 or MinIO), while the relational database stores only light metadata references (such as image file URLs, timestamps, user IDs, and IDs).

---

## 3. Architecture Diagram

```text
                               [ Users / Clients ]
                                        |
                                        v
                            [ Content Delivery Network ]
                                      (CDN)
                                        |
                                        v
                                 [ Load Balancer ]
                                        |
                       +----------------+----------------+
                       |                                 |
                       v                                 v
               [ App Server 1 ]                  [ App Server 2 ]
                   /   |   \                         /   |   \
                  /    |    \                       /    |    \
                 /     |     \                     /     |     \
                v      v      v                   v      v      v
        [In-Memory] [Object] [Message]    [In-Memory] [Object] [Message]
        [ Cache   ] [Storage] [ Queue ]   [ Cache   ] [Storage] [ Queue ]
           |           |         |           |           |         |
           |           |         v           |           |         v
           |           |    [ Thumbnail ]    |           |    [ Thumbnail ]
           |           |    [  Worker   ]    |           |    [  Worker   ]
           |           |         |           |           |         |
           |           +----+----+           |           +----+----+
           |                |                |                |
           +----------------|----------------+                |
                            v                                 v
                [ Primary Database (Writes) ]     [ Object Storage (S3) ]
                            |                     (Originals & Thumbnails)
                            v

## 4. 4. Component Responsibilities
CDN (Content Delivery Network): Caches static media content and thumbnails geographically close to users to reduce latency and origin server bandwidth.

Load Balancer: Distributes incoming HTTP traffic evenly across multiple stateless application servers to prevent any single server from becoming a bottleneck.

App Servers: Executes core application logic, authenticates requests, processes uploads, and constructs user feeds.

In-Memory Cache (Redis/Memcached): Stores frequently accessed feed data and user metadata in RAM to handle fast reads without hitting the database.

Primary Database (SQL Primary): Handles write operations (user registration, photo metadata creation, follow links) and maintains ACID transactional integrity.

Read Replica Database: Handles feed query reads by continuously syncing asynchronously with the Primary Database to offload read traffic.

Object Storage (AWS S3): Provides scalable, durable storage designed specifically for storing raw photo binary files and processed thumbnails.

Message Queue (RabbitMQ/Kafka): Buffers background tasks (like thumbnail generation requests) so photo uploads remain fast and decoupled.

Thumbnail Worker: Consumes background jobs from the Message Queue, asynchronously fetches original photos, generates optimized 50 KB thumbnails, and uploads them back to Object Storage.

##5. Step-by-Step Photo Upload Flow
Client Upload Request: The user selects a photo and sends a POST /photos request to the application server via the Load Balancer.

Direct Storage Upload: The App Server streams the 2 MB raw photo file directly into Object Storage (S3) and receives a unique object key/URL.

Metadata Persistence: The App Server writes a new record into the Primary Database containing the photo ID, user ID, raw image URL, and upload timestamp.

Asynchronous Job Dispatch: The App Server publishes a job event (e.g., { photoId: 102, rawUrl: "s3://..." }) to the Message Queue.

Immediate Client Response: The App Server immediately sends a 201 Created HTTP response back to the user, ensuring the upload feels instantaneous.

Background Worker Processing: A Thumbnail Worker picks up the message from the queue, downloads the raw photo, resizes it to a 50 KB thumbnail, and uploads the thumbnail to Object Storage.

Database & Cache Update: The Worker updates the photo's database record with the new thumbnailUrl and invalidates/updates relevant feed caches in the In-Memory Cache.

##6. Architectural Trade-offs
Eventual Consistency vs. Strong Consistency (Feeds):

Trade-off: By using Read Replicas and background queue processing, user feeds are eventually consistent.

Impact: When a user uploads a photo, followers might experience a short delay (1–3 seconds) before the new photo or thumbnail appears in their feed. This slight delay is acceptable to keep the system responsive under peak load.

Asynchronous Thumbnail Processing vs. Synchronous Processing:

Trade-off: Offloading thumbnail generation to a background Message Queue and Worker worker pool adds architectural complexity (requiring queue monitoring and worker orchestration).

Impact: The user gets a fast upload confirmation response without waiting for server-side image processing to complete, shielding user-facing app servers from CPU spikes caused by image resizing operations.