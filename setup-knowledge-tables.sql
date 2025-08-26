-- Инструкции по настройке 9 таблиц базы знаний в Google Sheets
-- Выполните эти шаги в Google Sheets

-- 1. Создайте 9 отдельных листов в вашей Google таблице:

/*
1. general_info - Общая информация о клинике
   Структура:
  
   - clinic_id
   - clinic_name
   - clinic_address
   - working_hours
   - contact_phone
   - emergency_phone
   - website
   - ai_greeting_owner
   - ai_greeting_admin
   - ai_style
   - ai_escalation_rules



2. animals_breeds - Виды и породы животных
   Структура:
    - animal_id
   - species
   - breed
   - size_category
   - average_weght
   - life_expectancy
   - common_conditions
   - special_care_notes
   - target_audience




3. situations - База симптомов и рекомендаций (ЯДРО СИСТЕМЫ)
   Структура:
   - situation_id
   - user_query
   - keywords
   - Animal_species
   - age_category
   - symptoms_checklist
   - follow_up_questions
   - ai_response_owner
   - ai_response_admin
   - urgency
   - urgency_indicators
   - contraindications
   - related_services
   - related_medications

ДАЛЬШЕ НЕ ОТРДЕАКТИРОВАНЫ, НУЖНО ДОБАВИТЬ ТЕ ПОЛЯ, КОТОРЫЕ ФАКТИЧЕСКИ В ТАБЛИЦЕ


4. pricelist - Прайс-лист услуг
   Структура:
   - service_id
   - service_name (название услуги)
   - service_category (категория услуги)
   - price (цена)
   - price_currency (валюта)
   - service_description (описание услуги)
   - duration_minutes (продолжительность в минутах)
   - preparation_required (требуется ли подготовка)
   - preparation_instructions (инструкции по подготовке)
   - is_emergency (экстренная услуга)
   - is_available (доступна ли услуга)

5. medications - Справочник препаратов
   Структура:
   - medication_id
   - medication_name (название препарата)
   - active_ingredient (действующее вещество)
   - dosage_form (форма выпуска)
   - indications (показания)
   - contraindications (противопоказания)
   - dosage_instructions (инструкции по дозировке)
   - side_effects (побочные эффекты)
   - storage_conditions (условия хранения)
   - prescription_required (требуется ли рецепт)
   - manufacturer (производитель)

6. intents - База намерений пользователей
   Структура:
   - intent_id
   - intent_name (название намерения)
   - intent_keywords (ключевые слова)
   - response_template (шаблон ответа)
   - intent_category (категория намерения)
   - priority_level (уровень приоритета)
   - user_type (тип пользователя: owner/admin)
   - confidence_threshold (порог уверенности)

7. preventive_care - Профилактический уход
   Структура:
   - procedure_id
   - procedure_name (название процедуры)
   - procedure_frequency (частота проведения)
   - age_group (возрастная группа)
   - procedure_description (описание процедуры)
   - importance_level (уровень важности)
   - cost_range_min (минимальная стоимость)
   - cost_range_max (максимальная стоимость)
   - species_applicable (применимо к видам животных)
   - preparation_required (требуется ли подготовка)

8. faq - Часто задаваемые вопросы
   Структура:
   - faq_id
   - question_text (текст вопроса)
   - answer_text (текст ответа)
   - faq_category (категория вопроса)
   - faq_keywords (ключевые слова)
   - related_topics (связанные темы)
   - user_type (тип пользователя: owner/admin)
   - frequency_asked (частота задавания)

9. response_template - Шаблоны ответов
   Структура:
   - template_id
   - template_name (название шаблона)
   - target_audience (аудитория: owner/admin)
   - situation_type (тип ситуации)
   - template_text (текст шаблона)
   - template_variables (переменные для подстановки)
   - response_tone (тон ответа: formal/friendly/urgent)
   - is_active (активен ли шаблон)
   - usage_count (количество использований)
*/

-- 2. Примеры данных для заполнения таблиц:

/*
general_info:
name | address | phone | email | working_hours | ai_style | description
"Ветеринарная клиника 'Лев'" | "ул. Примерная, 123" | "+7-999-123-45-67" | "info@leovet.ru" | "Пн-Пт 9:00-20:00, Сб-Вс 10:00-18:00" | "Дружелюбный, профессиональный, заботливый" | "Современная ветеринарная клиника с полным спектром услуг"

situations:
symptom | description | possible_causes | recommendations | urgency_level | when_to_contact_vet | prevention
"Рвота у кошки" | "Кошка рвет более 2 раз в день" | "Отравление, инфекция, неправильное питание" | "Убрать еду на 12 часов, давать воду, наблюдать" | "средний" | "Если рвота продолжается более 24 часов или есть кровь" | "Качественное питание, регулярные осмотры"

pricelist:
service_name | category | price | description | duration | preparation
"Консультация ветеринара" | "Прием" | "1500 руб" | "Осмотр животного, консультация" | "30 мин" | "Не требуется"
"Вакцинация от бешенства" | "Вакцинация" | "800 руб" | "Вакцинация от бешенства" | "15 мин" | "Животное должно быть здорово"

faq:
question | answer | category | keywords | related_topics
"Как часто нужно вакцинировать кошку?" | "Ежегодно, начиная с 3 месяцев" | "Вакцинация" | "вакцинация, кошка, частота" | "Вакцинация, Профилактика"
*/

-- 3. Важные замечания:

/*
- Первая строка каждого листа должна содержать заголовки столбцов
- Используйте русские названия для заголовков
- Данные должны быть структурированными и полными
- Избегайте пустых строк в середине данных
- Используйте единообразное форматирование дат и чисел
- Регулярно обновляйте информацию
- Проверяйте актуальность цен и рекомендаций
*/

-- 4. Настройка доступа:

/*
- Убедитесь, что таблица доступна по ссылке для чтения
- Проверьте, что API ключ Google Sheets имеет доступ к таблице
- ID таблицы должен быть правильным в коде
- Все листы должны иметь правильные названия (точно как в коде)
*/
