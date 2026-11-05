# Проверка версии 2.0.0

Дата: 5 ноября 2026 года.

31 автоматизированная проверка пройдена. Проверяется фактическая логика из собранного index.html.

## Логика оценки

- PASS — Complete four-jurisdiction case is preliminary ok
- PASS — Missing organizer cannot complete
- PASS — Two of four sources is incomplete
- PASS — Potential name match is consultation, not automatic legal ban
- PASS — Confirmed blocking organizer is stop
- PASS — Sanctioned visitor is reviewed according to role
- PASS — Blocked bank separately restricts payment
- PASS — Expired evidence requires recheck
- PASS — Missing identification prevents positive assessment
- PASS — Unknown ownership escalates
- PASS — Unapproved base methodology is explicit
- PASS — Paid participation needs payee and bank
- PASS — Approved disclosure needs evidence and scope
- PASS — Sensitive production and headcount text detected
- PASS — No dictionary matches does not complete material review
- PASS — Manual review requires identified version and full checklist
- PASS — Personal rules cannot replace mandatory checklist
- PASS — Material change invalidates decision fingerprint
- PASS — Finding disposition is covered by decision fingerprint
- PASS — Opening Gandiva never marks case approved
- PASS — Date interval validation prevents future screening
- PASS — No confidential template payload or credentials in output

## Документы и криптография

- PASS — PPTX extracts visible, hidden slides and speaker notes
- PASS — PPTX parsed text triggers required categories
- PASS — DOCX extracts tracked deletions and comments
- PASS — Corrupt ZIP is rejected
- PASS — Archive entry count limit is enforced
- PASS — Encrypted backup round-trip uses AES-GCM and no plaintext
- PASS — Tampered ciphertext is rejected
- PASS — ECDSA package verifies; changed payload fails
- PASS — Methodology import rejects invalid contacts and duplicate rules

Разбор PPTX/DOCX проверен на синтетических архивах: видимые и скрытые слайды, заметки, свойства, комментарии и удалённый текст. Для офлайн-теста XML использован адаптер DOM поверх xml-js. Это не проверка интерфейса в браузере.

## Ограничение проверки интерфейса

5 ноября 2026 года пользователь явно разрешил повторную браузерную проверку. Повторное открытие http://127.0.0.1:8765 также было отклонено: браузер сообщил о сохранённом запрете доступа или управляемой политике (saved permission or managed policy). Разрешение в чате не отменило эту настройку. Визуальная проверка, клики, реальная загрузка через интерфейс и мобильная компоновка в браузере не подтверждены. Обход ограничения не выполнялся. Для продолжения требуется снять сохранённый запрет для указанного адреса или изменить управляющую политику.

## Границы продукта

Автономный HTML без серверной части. Ручной санкционный скрининг, локальный словарный анализ материалов, шифрование копий и проверка подписанных пакетов. Нет автоматического подтверждения из Gandiva 2, корпоративной SSO-авторизации, центрального журнала, OCR и автоматической актуализации санкционных перечней. Статус методики, источники и технические ограничения явно отображаются в приложении.
