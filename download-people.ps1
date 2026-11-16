$root = "E:\AI-CITY\sites\quality-house-v2\assets\images\people"
New-Item -ItemType Directory -Force -Path $root | Out-Null

$urls = @(
  "https://qualityhouseintl.com/__l5e/assets-v1/7bf4152c-5c3f-45e7-b33c-ef3b83ae6781/ibrahim-abubaker-alsiddig.jpg",
  "https://qualityhouseintl.com/__l5e/assets-v1/ffd1f6e2-4723-4e3d-9fac-c1a6d6f8f927/abdulnasser-abubaker-alsiddig.png",
  "https://qualityhouseintl.com/__l5e/assets-v1/3edf0947-df71-40d0-b8b6-b258736c4352/sherine-abubaker-alsiddig-2.png",
  "https://qualityhouseintl.com/__l5e/assets-v1/9e6b3661-e820-4f4a-8ce2-05f2419599a5/manal-abubaker-alsiddig.png",
  "https://qualityhouseintl.com/__l5e/assets-v1/d51ceb1e-23d1-4c93-8211-631b68c68776/mujtaba-khalid-hassan.jpg",
  "https://qualityhouseintl.com/__l5e/assets-v1/321cceaa-7f1f-40c5-94c0-dd1d6770b829/ezzat-yousef-mohammed-ahmed.jpg",
  "https://qualityhouseintl.com/__l5e/assets-v1/2fd149a1-5643-45ee-8896-7c21e063859f/siddig-abdulnasser-abubaker-2.png",
  "https://qualityhouseintl.com/__l5e/assets-v1/86831dc6-780b-402f-b2fe-b479f558fb31/macarious.jpeg",
  "https://qualityhouseintl.com/__l5e/assets-v1/51e0809b-10f7-4583-b82b-cf8645f4bdab/jawad.png",
  "https://qualityhouseintl.com/__l5e/assets-v1/141ca575-a5c8-4105-ab1c-c6793f6ddaed/mohammed-ali-abdullatef.jpg",
  "https://qualityhouseintl.com/__l5e/assets-v1/5a7e3f56-3adb-44f5-9ed5-6ccd355fefe9/ammar-ahmed-mohammed.png",
  "https://qualityhouseintl.com/__l5e/assets-v1/52768651-bb7c-481b-8dc1-778630658293/tariq-sabry-ibrahim.jpg"
)

$names = @(
  "ibrahim-ceo.jpg",
  "abdulnasser-gm.png",
  "sherine-board.png",
  "manal-quality.png",
  "mujtaba-hr.jpg",
  "ezzat-finance.jpg",
  "siddig-marketing.png",
  "macarious-bd.jpeg",
  "jawad-export.png",
  "mohammed-warehouse.jpg",
  "ammar-scqa.png",
  "tariq-accountant.jpg"
)

for ($i = 0; $i -lt $urls.Count; $i++) {
  $dst = Join-Path $root $names[$i]
  try {
    Invoke-WebRequest -Uri $urls[$i] -OutFile $dst -TimeoutSec 30 -ErrorAction Stop
    Write-Host "OK $($names[$i])"
  } catch {
    Write-Host "FAIL $($names[$i]) : $($_.Exception.Message)"
  }
}
Get-ChildItem $root
