Add-Type -AssemblyName System.Drawing
function Draw-Icon {
    param($path, $size)
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.Clear([System.Drawing.Color]::FromArgb(251, 248, 243))
    $font = New-Object System.Drawing.Font('Segoe UI', $size * 0.55, [System.Drawing.FontStyle]::Bold)
    $brushGreen = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(62, 92, 70))
    $brushLime = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(204, 214, 127))
    $rect = New-Object System.Drawing.RectangleF(0, $size * 0.15, $size, $size * 0.7)
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    $g.DrawString('TP', $font, $brushGreen, $rect, $sf)
    $penLime = New-Object System.Drawing.Pen($brushLime, $size * 0.04)
    $g.DrawLine($penLime, $size * 0.28, $size * 0.75, $size * 0.72, $size * 0.75)
    $g.DrawEllipse($brushLime, $size * 0.5 - $size * 0.025, $size * 0.85, $size * 0.05, $size * 0.05)
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose(); $bmp.Dispose(); $font.Dispose(); $brushGreen.Dispose(); $brushLime.Dispose(); $penLime.Dispose()
}
Draw-Icon 'public/icons/icon-192.png' 192
Draw-Icon 'public/icons/icon-512.png' 512
Write-Host 'Done'
