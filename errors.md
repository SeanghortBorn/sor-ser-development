# Illuminate\Foundation\ViteException - Internal Server Error

Unable to locate file in Vite manifest: resources/js/Pages/Homes/index.jsx.

PHP 8.2.29
Laravel 12.41.1
localhost:8000

## Stack Trace

0 - vendor/laravel/framework/src/Illuminate/Foundation/Vite.php:999
1 - vendor/laravel/framework/src/Illuminate/Foundation/Vite.php:390
2 - resources/views/app.blade.php:17
3 - vendor/laravel/framework/src/Illuminate/Filesystem/Filesystem.php:123
4 - vendor/laravel/framework/src/Illuminate/Filesystem/Filesystem.php:124
5 - vendor/laravel/framework/src/Illuminate/View/Engines/PhpEngine.php:57
6 - vendor/laravel/framework/src/Illuminate/View/Engines/CompilerEngine.php:76
7 - vendor/laravel/framework/src/Illuminate/View/View.php:208
8 - vendor/laravel/framework/src/Illuminate/View/View.php:191
9 - vendor/laravel/framework/src/Illuminate/View/View.php:160
10 - vendor/laravel/framework/src/Illuminate/Http/Response.php:78
11 - vendor/laravel/framework/src/Illuminate/Http/Response.php:34
12 - vendor/laravel/framework/src/Illuminate/Routing/ResponseFactory.php:61
13 - vendor/laravel/framework/src/Illuminate/Routing/ResponseFactory.php:91
14 - vendor/laravel/framework/src/Illuminate/Support/Facades/Facade.php:363
15 - vendor/inertiajs/inertia-laravel/src/Response.php:199
16 - vendor/laravel/framework/src/Illuminate/Routing/Router.php:921
17 - vendor/laravel/framework/src/Illuminate/Routing/Router.php:906
18 - vendor/laravel/framework/src/Illuminate/Routing/Router.php:821
19 - vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php:180
20 - app/Http/Middleware/BlockIfUserIsBlocked.php:21
21 - vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php:219
22 - vendor/laravel/framework/src/Illuminate/Http/Middleware/AddLinkHeadersForPreloadedAssets.php:32
23 - vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php:219
24 - vendor/inertiajs/inertia-laravel/src/Middleware.php:103
25 - vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php:219
26 - vendor/laravel/jetstream/src/Http/Middleware/ShareInertiaData.php:69
27 - vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php:219
28 - vendor/laravel/framework/src/Illuminate/Routing/Middleware/SubstituteBindings.php:50
29 - vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php:219
30 - vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/VerifyCsrfToken.php:87
31 - vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php:219
32 - vendor/laravel/framework/src/Illuminate/View/Middleware/ShareErrorsFromSession.php:48
33 - vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php:219
34 - vendor/laravel/framework/src/Illuminate/Session/Middleware/StartSession.php:120
35 - vendor/laravel/framework/src/Illuminate/Session/Middleware/StartSession.php:63
36 - vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php:219
37 - vendor/laravel/framework/src/Illuminate/Cookie/Middleware/AddQueuedCookiesToResponse.php:36
38 - vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php:219
39 - vendor/laravel/framework/src/Illuminate/Cookie/Middleware/EncryptCookies.php:74
40 - vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php:219
41 - vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php:137
42 - vendor/laravel/framework/src/Illuminate/Routing/Router.php:821
43 - vendor/laravel/framework/src/Illuminate/Routing/Router.php:800
44 - vendor/laravel/framework/src/Illuminate/Routing/Router.php:764
45 - vendor/laravel/framework/src/Illuminate/Routing/Router.php:753
46 - vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php:200
47 - vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php:180
48 - vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TransformsRequest.php:21
49 - vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/ConvertEmptyStringsToNull.php:31
50 - vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php:219
51 - vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TransformsRequest.php:21
52 - vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TrimStrings.php:51
53 - vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php:219
54 - vendor/laravel/framework/src/Illuminate/Http/Middleware/ValidatePostSize.php:27
55 - vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php:219
56 - vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/PreventRequestsDuringMaintenance.php:109
57 - vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php:219
58 - vendor/laravel/framework/src/Illuminate/Http/Middleware/HandleCors.php:48
59 - vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php:219
60 - vendor/laravel/framework/src/Illuminate/Http/Middleware/TrustProxies.php:58
61 - vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php:219
62 - vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/InvokeDeferredCallbacks.php:22
63 - vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php:219
64 - vendor/laravel/framework/src/Illuminate/Http/Middleware/ValidatePathEncoding.php:26
65 - vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php:219
66 - vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php:137
67 - vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php:175
68 - vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php:144
69 - vendor/laravel/framework/src/Illuminate/Foundation/Application.php:1220
70 - public/index.php:17
71 - vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php:23

## Request

GET /home

## Headers

* **host**: localhost:8000
* **connection**: keep-alive
* **upgrade-insecure-requests**: 1
* **user-agent**: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36
* **accept**: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
* **sec-fetch-site**: none
* **sec-fetch-mode**: navigate
* **sec-fetch-user**: ?1
* **sec-fetch-dest**: document
* **sec-ch-ua**: "Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"
* **sec-ch-ua-mobile**: ?0
* **sec-ch-ua-platform**: "Windows"
* **accept-encoding**: gzip, deflate, br, zstd
* **accept-language**: en-US,en;q=0.9
* **cookie**: XSRF-TOKEN=eyJpdiI6IjNGY3lralZBdWdnVFZQVTRCdmZxSWc9PSIsInZhbHVlIjoiK0JLZnowMWdYRW1HTDBZZ2NYbkdsME1yVzFLalFGOGMrTUhmRGs1YzVQMUtqT0pTQUZ2bGM4dWhZRTNjYWQ3RHlOaGNQOFVQSk10NFNWZWVGU2hmZHNGMzZheEJBblFRSnZJbGszNGdYU3ZEcGlvVFBaTmxGWm5ScHBZdGp2bVMiLCJtYWMiOiJjZWExM2E5NDI0MWZjYzE1Y2JlMTJmNjFlYmJjMjAzNDU3N2JjMDZmZDhjNWU2YjYwMmVjYjI2OWM0ZTUyMGI2IiwidGFnIjoiIn0%3D; sor_ser_session=eyJpdiI6ImVDSkVXajRVSmxZMDQvOGE2T054N2c9PSIsInZhbHVlIjoiNWkzL1ZXUEJnSVlnRkdvdDRjVGRJWC8wTHhkWjRCaDZmbmI3ZmdkREVJbXQ0UEV2NTFYYUVjRjNudS9JdXdqM29kSDRxamd5L0w2eXAxQ3QxZHZmZ2RkYkJBeHFFbzF6cEZodmU2Mk5Icm95OFpYaFY0UmFXSlF3SDlFNmRBRXIiLCJtYWMiOiI1YmU2NGQzMjViMWZjNWM5NTI5MWRlZDRjNDlmZmY3OTcxODY0MWJmZmE1NWQ5OTcyOWFjYTFkMTJjM2VkNzE5IiwidGFnIjoiIn0%3D

## Route Context

controller: \Inertia\Controller
route name: home
middleware: web

## Route Parameters

{
    "component": "Homes/index",
    "props": []
}

## Database Queries

* mysql - select * from `sessions` where `id` = '4vLalHOSb5LIO7NLhpIT5IGdUcFhB9QROuw8kyZg' limit 1 (9.92 ms)
* mysql - select * from `users` where `id` = 1 and `users`.`deleted_at` is null limit 1 (5.04 ms)
* mysql - select `roles`.*, `model_has_roles`.`model_id` as `pivot_model_id`, `model_has_roles`.`role_id` as `pivot_role_id`, `model_has_roles`.`model_type` as `pivot_model_type` from `roles` inner join `model_has_roles` on `roles`.`id` = `model_has_roles`.`role_id` where `model_has_roles`.`model_id` = 1 and `model_has_roles`.`model_type` = 'App\Models\User' (4.56 ms)
* mysql - select `permissions`.*, `role_has_permissions`.`role_id` as `pivot_role_id`, `role_has_permissions`.`permission_id` as `pivot_permission_id` from `permissions` inner join `role_has_permissions` on `permissions`.`id` = `role_has_permissions`.`permission_id` where `role_has_permissions`.`role_id` in (4) (4.38 ms)
* mysql - select * from `cache` where `key` in ('spatie.permission.cache') (2.3 ms)
* mysql - select `permissions`.*, `model_has_permissions`.`model_id` as `pivot_model_id`, `model_has_permissions`.`permission_id` as `pivot_permission_id`, `model_has_permissions`.`model_type` as `pivot_model_type` from `permissions` inner join `model_has_permissions` on `permissions`.`id` = `model_has_permissions`.`permission_id` where `model_has_permissions`.`model_id` in (1) and `model_has_permissions`.`model_type` = 'App\Models\User' (2.69 ms)
