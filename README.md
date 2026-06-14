# E-Menu SaaS

QR-based digital menu platform for restaurants, cafés, clubs, and shops.

## Tech Stack

- Laravel API
- React
- Tailwind CSS
- MySQL
- SweetAlert2
- jQuery
- DataTables

## Project Structure

- backend: Laravel API
- frontend: React customer/admin UI
- docs: project documents

## Local Setup

### Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan storage:link
php artisan serve
