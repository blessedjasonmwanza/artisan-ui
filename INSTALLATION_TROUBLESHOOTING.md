# Installation Troubleshooting Guide

## PHP Version Compatibility Issues

If you encounter installation errors related to PHP version constraints, this guide will help you resolve them.

### Issue: "nette/schema v1.3.2 requires php 8.1 - 8.4"

This error occurs when you're using a PHP version that isn't yet supported by Laravel's dependency chain. This can happen if:
- You're using a pre-release PHP version (like PHP 8.5-dev)
- Laravel's dependencies haven't been updated for the latest PHP version yet

### Solution 1: Override Platform PHP Version (Recommended)

If you know the package works with your PHP version, you can tell Composer to ignore platform checks:

```bash
composer config allow-plugins.composer/package-versions true --no-update
composer require blessedjasonmwanza/artisan-ui --ignore-platform-req=php
```

Or add to your `composer.json`:

```json
{
    "config": {
        "platform": {
            "php": "8.4"
        }
    }
}
```

Then run:
```bash
composer require blessedjasonmwanza/artisan-ui
```

### Solution 2: Update Laravel Dependencies

The issue often comes from Laravel's own dependencies. Update all dependencies together:

```bash
composer update
composer require blessedjasonmwanza/artisan-ui
```

This ensures Laravel and its entire dependency chain are up-to-date with support for your PHP version.

### Solution 3: Use Exact Version Constraint

Sometimes being explicit helps:

```bash
composer require "blessedjasonmwanza/artisan-ui:@dev"
```

### Solution 4: Check PHP Version

Verify your installed PHP version:

```bash
php --version
```

If you're using a development/pre-release version, consider using a stable release instead.

## Common Scenarios

### Scenario 1: Using PHP 8.5 (Pre-release)

PHP 8.5 is not yet officially released. If using a pre-release version:

```bash
# Override the platform requirement
composer config platform.php 8.4
composer require blessedjasonmwanza/artisan-ui
```

### Scenario 2: Laravel Framework is Locked

If your Laravel framework version is locked to an older version:

```bash
# Update Laravel framework first
composer update laravel/framework
# Then install the package
composer require blessedjasonmwanza/artisan-ui
```

### Scenario 3: Multiple Conflicting Packages

If other packages have conflicting requirements:

```bash
# Update all dependencies
composer update
# Use ignore-platform to override
composer require blessedjasonmwanza/artisan-ui --ignore-platform-req=*
```

## Package Compatibility

Artisan UI is designed to work with:
- **PHP**: 8.2+ (we use `>=8.2` to support future PHP versions)
- **Laravel**: 10.0, 11.0, 12.0+
- **Symfony Process**: 6.0+

Your specific PHP version (8.5.2) should work fine with the package itself. The issue is upstream dependencies haven't declared support for it yet.

## Getting Help

If you still can't install after trying these solutions:

1. Check your PHP version: `php --version`
2. Check Laravel version: `php artisan --version`
3. Run: `composer diagnose`
4. Check your `composer.lock` for conflicting versions

## Composer Cache Issues

Sometimes Composer's cache can cause issues. Clear it:

```bash
composer clear-cache
composer update
```

## Using a Docker/Dev Container

If you're having persistent issues, consider using a Docker container with a known-good PHP version:

```dockerfile
FROM php:8.4-fpm-alpine

RUN docker-php-ext-install pdo_mysql
```

Then run installation inside the container.

## Platform-Specific Notes

### macOS
If you installed PHP via Homebrew and it's a pre-release version, the standard installation may have conflicts. Consider using https://laravel.build or Docker.

### Linux  
Ensure your PHP version matches what your package manager provides, or compile from source only if necessary.

### Windows
Use Laravel Sail or WSL2 for consistent dependency resolution.

## Reporting the Issue

If none of these solutions work, please report with:

1. Output of: `php --version`
2. Output of: `composer diagnose`
3. Your `composer.json` PHP requirement
4. Full error message from Composer

This helps maintainers ensure compatibility with future PHP versions.
