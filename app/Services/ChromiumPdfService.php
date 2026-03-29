<?php

namespace App\Services;

use Illuminate\Contracts\View\Factory as ViewFactory;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\File;
use RuntimeException;
use Symfony\Component\Process\Process;

class ChromiumPdfService
{
    public function __construct(private readonly ViewFactory $view)
    {
    }

    public function download(string $viewName, array $data, string $filename)
    {
        $tempDir = storage_path('app/pdf-temp');
        File::ensureDirectoryExists($tempDir);

        $htmlPath = tempnam($tempDir, 'html_');
        $pdfPath = tempnam($tempDir, 'pdf_');

        if (! $htmlPath || ! $pdfPath) {
            abort(500, 'Could not allocate temporary PDF files.');
        }

        $htmlPathWithExt = $htmlPath . '.html';
        $pdfPathWithExt = $pdfPath . '.pdf';

        rename($htmlPath, $htmlPathWithExt);
        rename($pdfPath, $pdfPathWithExt);

        File::put($htmlPathWithExt, $this->view->make($viewName, $data)->render());

        $browserPath = $this->resolveBrowserPath();
        $targetUrl = $this->buildFileUrl($htmlPathWithExt);

        $process = new Process([
            $browserPath,
            '--headless=new',
            '--disable-gpu',
            '--no-sandbox',
            '--run-all-compositor-stages-before-draw',
            '--virtual-time-budget=2500',
            '--print-to-pdf=' . $pdfPathWithExt,
            '--print-to-pdf-no-header',
            $targetUrl,
        ]);

        $process->setTimeout((int) config('services.pdf.timeout', 60));
        $process->run();

        if (! $process->isSuccessful() || ! File::exists($pdfPathWithExt)) {
            $error = trim($process->getErrorOutput() ?: $process->getOutput());
            File::delete([$htmlPathWithExt, $pdfPathWithExt]);

            if (App::environment('local')) {
                throw new RuntimeException('PDF generation failed: ' . ($error ?: 'Unknown Chromium error.'));
            }

            abort(500, 'PDF generation failed.');
        }

        File::delete($htmlPathWithExt);

        return response()->download($pdfPathWithExt, $filename, [
            'Content-Type' => 'application/pdf',
        ])->deleteFileAfterSend(true);
    }

    private function resolveBrowserPath(): string
    {
        $configured = config('services.pdf.chrome_path');
        if (is_string($configured) && $configured !== '' && File::exists($configured)) {
            return $configured;
        }

        $candidates = match (PHP_OS_FAMILY) {
            'Windows' => [
                'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
                'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
                'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
                'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
            ],
            'Darwin' => [
                '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
                '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
                '/Applications/Chromium.app/Contents/MacOS/Chromium',
            ],
            default => [
                '/usr/bin/chromium',
                '/usr/bin/chromium-browser',
                '/usr/bin/google-chrome',
                '/snap/bin/chromium',
            ],
        };

        foreach ($candidates as $candidate) {
            if (File::exists($candidate)) {
                return $candidate;
            }
        }

        throw new RuntimeException('No Chromium-compatible browser was found. Configure PDF_CHROME_PATH in your .env file.');
    }

    private function buildFileUrl(string $path): string
    {
        $normalized = str_replace(DIRECTORY_SEPARATOR, '/', $path);

        if (PHP_OS_FAMILY === 'Windows') {
            return 'file:///' . ltrim(str_replace(' ', '%20', $normalized), '/');
        }

        return 'file://' . $normalized;
    }
}
