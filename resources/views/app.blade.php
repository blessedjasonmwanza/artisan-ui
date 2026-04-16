<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Artisan UI</title>
    <script>
        window.ArtisanUI = {
            path: '{{ config("artisan-ui.path") }}',
            baseUrl: '{{ url(config("artisan-ui.path")) }}',
            apiUrl: '{{ url(config("artisan-ui.path") . "/api") }}'
        };
    </script>
    <link rel="stylesheet" href="{{ asset('vendor/artisan-ui/index.css') }}?v={{ \Blessedjasonmwanza\ArtisanUi\ArtisanUiServiceProvider::VERSION }}">
</head>
<body>
    <div id="root"></div>
    <script type="module" src="{{ asset('vendor/artisan-ui/index.js') }}?v={{ \Blessedjasonmwanza\ArtisanUi\ArtisanUiServiceProvider::VERSION }}"></script>
</body>
</html>
