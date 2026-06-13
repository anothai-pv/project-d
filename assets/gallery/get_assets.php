<?php
// This script scans the current directory for files and returns them as a JSON list.
// It ignores this script itself and hidden files.

$files = scandir('.');
$result = [];

foreach ($files as $file) {
    // Skip directories and this script
    if (!is_dir($file) && $file !== 'get_assets.php' && !str_starts_with($file, '.')) {
        $result[] = $file;
    }
}

header('Content-Type: application/json');
echo json_encode($result);
?>
