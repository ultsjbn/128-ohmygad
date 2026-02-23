<!-- I was thinking we make this the main template for the different pages? -->
<!-- Since the diff pages (mostly) contain the same kinds of elements and stuff  -->

<!-- uhh -->
<html>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OhMyGAD!</title>

    <!-- Tailwind CSS (v3) — matches project dependency in package.json -->
    <script src="https://cdn.tailwindcss.com"></script>

    <!-- Lucide Icons — lucide-react used across components/ -->
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>

    <style>
        /* Page-specific styles */
    </style>
</head>

<body class="bg-background text-foreground antialiased">

    <div class="header" id="home-header">
        <?php
        // include __DIR__ . '/../partials/header.php'; (for future shared header partial)
        ?>
    </div>

    <div class="container" id="home-container">

        <div class="sidebar" id="home-sidebar">
            <p>sidebar goes here</p>
        </div>

        <div class="body" id="home-body">
            <p>body goes here</p>
        </div>

    </div>

    <div class="footer" id="home-footer">
        <?php
        // include __DIR__ . '/../partials/footer.php'; (for future shared footer partial)
        ?>
        <p>footer goes here</p>
    </div>

    <!-- Initialize Lucide icons -->
    <script>lucide.createIcons();</script>

</body>

</html>