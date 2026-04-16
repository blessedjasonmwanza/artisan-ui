# Artisan UI

Artisan UI is a production-grade Laravel package that provides a secure, modern web-based interface for your Artisan commands. No more typing in the terminal—manage your application through a beautiful graphical UI.

![Artisan UI Preview](https://via.placeholder.com/1200x600?text=Artisan+UI+Modern+Dashboard)

## Features

- **🚀 Dynamic Discovery**: Automatically finds all your Artisan commands.
- **🛡️ Secure by Default**: Standalone authentication system and command filtering.
- **📊 Live Console**: See command output in real-time as if you were in the terminal.
- **📱 Modern Design**: Built with React and Radix Themes for a premium feel.
- **🕵️ Audit Logs**: Full history of every command executed, who ran it, and what the output was.

## Requirements

- PHP 8.1+
- Laravel 10.0 or 11.0

## Installation

Getting started is simple. Follow these 3 steps:

### 1. Install via Composer
Run the following command in your terminal:
```bash
composer require blessedjasonmwanza/artisan-ui
```

### 2. Run the Installation Command
This will publish the configuration, assets, and run the database migrations for you:
```bash
php artisan artisan-ui:install
```

### 3. Setup Your First Admin
Navigate to `/artisan-ui` in your browser. Since it's your first time, you will be redirected to the setup page to create your administrator account.

---

## Configuration

You can customize the package by editing `config/artisan-ui.php`.

### Command Whitelist/Blacklist
Control which commands are visible in the UI:
```php
'commands' => [
    'only' => [], // Leave empty to show all
    'exclude' => [
        'tinker',
        'up',
        'down',
    ],
],
```

### Path & Middleware
Change the URL or add your own security layers:
```php
'path' => 'my-custom-artisan-path',
'middleware' => ['web', 'auth'],
```

## Security

- **No Shell Execution**: We use `symfony/process` to run *only* legitimate Laravel commands.
- **Standalone Auth**: Artisan UI doesn't touch your main `users` table. It uses its own secure authentication.
- **Input Validation**: All arguments and options are strictly validated before execution.

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
