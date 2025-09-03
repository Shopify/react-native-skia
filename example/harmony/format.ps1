/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

$directoryPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$filePaths = Get-ChildItem $directoryPath -Recurse -Include *.h, *.cpp |
Where-Object {
  $_.DirectoryName -notmatch 'third-party' -and
  $_.DirectoryName -notmatch 'patches' -and
  $_.DirectoryName -notmatch 'node_modules' -and
  $_.DirectoryName -notmatch '.cxx' -and
  $_.DirectoryName -notmatch 'build'
}
foreach ($filePath in $filePaths) {
  & "clang-format.exe" -style=file -i $filePath.FullName
}