<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ─── Organizations (multi-tenant root) ────────────────────────────
        Schema::create('organizations', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->string('name');
            $t->string('slug')->unique();
            $t->string('phone')->nullable();
            $t->string('email')->nullable();
            $t->string('address')->nullable();
            $t->string('logo_url')->nullable();
            $t->string('plan')->default('free');
            $t->string('master_password');
            $t->json('settings')->nullable();
            $t->boolean('active')->default(true);
            $t->string('asaas_customer_id')->nullable();
            $t->string('whatsapp_phone_number_id')->nullable();
            $t->timestamps();
        });

        // ─── Staff Users ──────────────────────────────────────────────────
        Schema::create('staff_users', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->foreignUuid('organization_id')->constrained('organizations')->cascadeOnDelete();
            $t->string('name');
            $t->string('email')->nullable();
            $t->string('password_hash');
            $t->enum('role', ['owner', 'admin', 'staff'])->default('staff');
            $t->string('photo_url')->nullable();
            $t->boolean('active')->default(true);
            $t->timestamps();
            $t->unique(['organization_id', 'email']);
        });

        // ─── Clients ─────────────────────────────────────────────────────
        Schema::create('clients', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->foreignUuid('organization_id')->constrained('organizations')->cascadeOnDelete();
            $t->string('name');
            $t->string('email')->nullable();
            $t->string('phone')->nullable();
            $t->string('photo_url')->nullable();
            $t->enum('status', ['active', 'inactive', 'vip'])->default('active');
            $t->text('notes')->nullable();
            $t->integer('total_appointments')->default(0);
            $t->decimal('total_spent', 10, 2)->default(0);
            $t->timestamp('last_visit_at')->nullable();
            $t->timestamps();
        });

        // ─── Services ────────────────────────────────────────────────────
        Schema::create('services', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->foreignUuid('organization_id')->constrained('organizations')->cascadeOnDelete();
            $t->string('name');
            $t->text('description')->nullable();
            $t->decimal('price', 10, 2)->default(0);
            $t->integer('duration_minutes')->default(30);
            $t->string('color')->nullable();
            $t->boolean('active')->default(true);
            $t->timestamps();
        });

        // ─── Professionals ────────────────────────────────────────────────
        Schema::create('professionals', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->foreignUuid('organization_id')->constrained('organizations')->cascadeOnDelete();
            $t->string('name');
            $t->string('email')->nullable();
            $t->string('phone')->nullable();
            $t->string('photo_url')->nullable();
            $t->json('roles')->nullable();
            $t->json('working_hours')->nullable();
            $t->decimal('commission_percent', 5, 2)->default(0);
            $t->boolean('active')->default(true);
            $t->timestamps();
        });

        // ─── Professional <-> Service (pivot) ─────────────────────────────
        Schema::create('professional_services', function (Blueprint $t) {
            $t->foreignUuid('professional_id')->constrained('professionals')->cascadeOnDelete();
            $t->foreignUuid('service_id')->constrained('services')->cascadeOnDelete();
            $t->primary(['professional_id', 'service_id']);
        });

        // ─── Appointments ──────────────────────────────────────────────────
        Schema::create('appointments', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->foreignUuid('organization_id')->constrained('organizations')->cascadeOnDelete();
            $t->foreignUuid('client_id')->constrained('clients')->cascadeOnDelete();
            $t->foreignUuid('service_id')->constrained('services');
            $t->foreignUuid('professional_id')->constrained('professionals');
            $t->timestamp('starts_at');
            $t->integer('duration_minutes');
            $t->decimal('price', 10, 2);
            $t->enum('status', ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'])->default('pending');
            $t->text('notes')->nullable();
            $t->string('cancelled_reason')->nullable();
            $t->string('source')->default('internal');
            $t->timestamps();

            $t->index(['organization_id', 'starts_at']);
            $t->index(['professional_id', 'starts_at']);
        });

        // ─── Reviews ─────────────────────────────────────────────────────
        Schema::create('reviews', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->foreignUuid('organization_id')->constrained('organizations')->cascadeOnDelete();
            $t->foreignUuid('appointment_id')->constrained('appointments')->cascadeOnDelete();
            $t->foreignUuid('client_id')->constrained('clients');
            $t->foreignUuid('professional_id')->constrained('professionals');
            $t->tinyInteger('rating');
            $t->text('comment')->nullable();
            $t->boolean('public')->default(true);
            $t->timestamps();
            $t->unique('appointment_id');
        });

        // ─── Cashiers (Caixa) ─────────────────────────────────────────────
        Schema::create('cashiers', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->foreignUuid('organization_id')->constrained('organizations')->cascadeOnDelete();
            $t->foreignUuid('opened_by')->constrained('staff_users');
            $t->foreignUuid('closed_by')->nullable()->constrained('staff_users');
            $t->decimal('opening_balance', 10, 2)->default(0);
            $t->decimal('closing_balance', 10, 2)->nullable();
            $t->timestamp('opened_at');
            $t->timestamp('closed_at')->nullable();
            $t->text('notes')->nullable();
        });

        // ─── Cash Entries (Lançamentos) ────────────────────────────────────
        Schema::create('cash_entries', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->foreignUuid('cashier_id')->constrained('cashiers')->cascadeOnDelete();
            $t->foreignUuid('organization_id')->constrained('organizations')->cascadeOnDelete();
            $t->foreignUuid('appointment_id')->nullable()->constrained('appointments');
            $t->foreignUuid('professional_id')->nullable()->constrained('professionals');
            $t->enum('type', ['income', 'expense', 'commission']);
            $t->enum('payment_method', ['cash', 'card', 'pix', 'transfer', 'other'])->default('cash');
            $t->decimal('amount', 10, 2);
            $t->string('description');
            $t->timestamps();
        });

        // ─── Notifications ─────────────────────────────────────────────────
        Schema::create('notifications', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->foreignUuid('organization_id')->constrained('organizations')->cascadeOnDelete();
            $t->foreignUuid('appointment_id')->nullable()->constrained('appointments');
            $t->string('type');
            $t->string('title');
            $t->text('message');
            $t->boolean('read')->default(false);
            $t->timestamps();
        });

        // ─── WhatsApp ─────────────────────────────────────────────────────
        Schema::create('whatsapp_conversations', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->foreignUuid('organization_id')->constrained('organizations')->cascadeOnDelete();
            $t->foreignUuid('client_id')->nullable()->constrained('clients');
            $t->string('wa_phone');
            $t->string('wa_name')->nullable();
            $t->integer('unread_count')->default(0);
            $t->timestamp('last_message_at')->nullable();
            $t->timestamps();
            $t->unique(['organization_id', 'wa_phone']);
        });

        Schema::create('whatsapp_messages', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->foreignUuid('conversation_id')->constrained('whatsapp_conversations')->cascadeOnDelete();
            $t->string('wa_message_id')->nullable()->unique();
            $t->enum('direction', ['inbound', 'outbound']);
            $t->enum('type', ['text', 'image', 'template', 'interactive'])->default('text');
            $t->text('content');
            $t->json('payload')->nullable();
            $t->enum('status', ['sent', 'delivered', 'read', 'failed'])->nullable();
            $t->timestamps();
        });

        // ─── AI Suggestions ────────────────────────────────────────────────
        Schema::create('ai_suggestions', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->foreignUuid('organization_id')->constrained('organizations')->cascadeOnDelete();
            $t->foreignUuid('client_id')->nullable()->constrained('clients');
            $t->string('type');
            $t->json('suggestion');
            $t->boolean('acted_on')->default(false);
            $t->timestamps();
        });

        // ─── Infrastructure ───────────────────────────────────────────────
        Schema::create('jobs', function (Blueprint $t) {
            $t->id();
            $t->string('queue')->index();
            $t->longText('payload');
            $t->unsignedTinyInteger('attempts');
            $t->unsignedInteger('reserved_at')->nullable();
            $t->unsignedInteger('available_at');
            $t->unsignedInteger('created_at');
        });

        Schema::create('failed_jobs', function (Blueprint $t) {
            $t->id();
            $t->string('uuid')->unique();
            $t->text('connection');
            $t->text('queue');
            $t->longText('payload');
            $t->longText('exception');
            $t->timestamp('failed_at')->useCurrent();
        });

        Schema::create('cache', function (Blueprint $t) {
            $t->string('key')->primary();
            $t->mediumText('value');
            $t->integer('expiration');
        });

        Schema::create('cache_locks', function (Blueprint $t) {
            $t->string('key')->primary();
            $t->string('owner');
            $t->integer('expiration');
        });

        Schema::create('sessions', function (Blueprint $t) {
            $t->string('id')->primary();
            $t->foreignId('user_id')->nullable()->index();
            $t->string('ip_address', 45)->nullable();
            $t->text('user_agent')->nullable();
            $t->longText('payload');
            $t->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        collect([
            'sessions', 'cache_locks', 'cache', 'failed_jobs', 'jobs',
            'ai_suggestions', 'whatsapp_messages', 'whatsapp_conversations',
            'notifications', 'cash_entries', 'cashiers', 'reviews',
            'appointments', 'professional_services', 'professionals',
            'services', 'clients', 'staff_users', 'organizations',
        ])->each(fn ($t) => Schema::dropIfExists($t));
    }
};
