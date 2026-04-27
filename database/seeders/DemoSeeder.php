<?php
namespace Database\Seeders;
use App\Models\Organization;
use App\Models\StaffUser;
use App\Models\Client;
use App\Models\Service;
use App\Models\Professional;
use App\Models\Appointment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $org = Organization::create([
            'id'              => Str::uuid(),
            'name'            => 'Barber King',
            'slug'            => 'barber-king',
            'phone'           => '(11) 99999-0001',
            'email'           => 'contato@barberking.com',
            'plan'            => 'pro',
            'master_password' => '123456',
            'settings'        => ['timezone' => 'America/Sao_Paulo'],
        ]);

        $owner = StaffUser::create([
            'id'              => Str::uuid(),
            'organization_id' => $org->id,
            'name'            => 'Alexandre Silva',
            'email'           => 'alex@barberking.com',
            'password_hash'   => password_hash('123456', PASSWORD_BCRYPT),
            'role'            => 'owner',
        ]);

        $services = collect([
            ['name' => 'Corte Masculino', 'price' => 45, 'duration_minutes' => 30],
            ['name' => 'Barba Completa',  'price' => 35, 'duration_minutes' => 25],
            ['name' => 'Corte + Barba',   'price' => 70, 'duration_minutes' => 50],
            ['name' => 'Degradê / Fade',  'price' => 55, 'duration_minutes' => 40],
        ])->map(fn ($s) => Service::create(['id' => Str::uuid(), 'organization_id' => $org->id, ...$s]));

        $professionals = collect([
            ['name' => 'Ricardo Barber', 'commission_percent' => 40],
            ['name' => 'Thiago Cortes',  'commission_percent' => 35],
        ])->map(fn ($p) => Professional::create([
            'id'              => Str::uuid(),
            'organization_id' => $org->id,
            'roles'           => ['Barbeiro'],
            'working_hours'   => [
                'Monday'    => ['isWorking' => true, 'start' => '08:00', 'end' => '18:00'],
                'Tuesday'   => ['isWorking' => true, 'start' => '08:00', 'end' => '18:00'],
                'Wednesday' => ['isWorking' => true, 'start' => '08:00', 'end' => '18:00'],
                'Thursday'  => ['isWorking' => true, 'start' => '08:00', 'end' => '18:00'],
                'Friday'    => ['isWorking' => true, 'start' => '08:00', 'end' => '19:00'],
                'Saturday'  => ['isWorking' => true, 'start' => '09:00', 'end' => '17:00'],
                'Sunday'    => ['isWorking' => false],
            ],
            ...$p,
        ]));

        foreach ($professionals as $prof) {
            $prof->services()->sync($services->pluck("id")->map(fn($id) => (string)$id)->toArray());
        }

        $clients = collect(['João Silva', 'Pedro Costa', 'Rafael Mendes', 'Lucas Oliveira'])
            ->map(fn ($name) => Client::create([
                'id'              => Str::uuid(),
                'organization_id' => $org->id,
                'name'            => $name,
                'phone'           => '(11) 9' . rand(1000, 9999) . '-' . rand(1000, 9999),
                'status'          => 'active',
            ]));

        $this->command->info("Demo: slug=barber-king | email=alex@barberking.com");
    }
}
