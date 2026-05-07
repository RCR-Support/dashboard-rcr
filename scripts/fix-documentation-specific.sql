-- Script para corregir el campo isSpecific en ActivityDocumentation
-- 
-- PROBLEMA: Documentos marcados como "específicos" que aparecen en múltiples actividades
-- SOLUCIÓN: Marcarlos como isSpecific = false (globales/comunes)

-- ============================================================
-- PASO 1: Ver qué documentos están mal configurados
-- ============================================================

SELECT 
  d.name AS documento,
  COUNT(DISTINCT ad."activityId") AS num_actividades,
  BOOL_AND(ad."isSpecific") AS todos_marcados_especificos,
  STRING_AGG(DISTINCT a.name, ', ' ORDER BY a.name) AS actividades
FROM "ActivityDocumentation" ad
JOIN "Documentation" d ON d.id = ad."documentationId"
JOIN "Activity" a ON a.id = ad."activityId"
GROUP BY d.id, d.name
HAVING COUNT(DISTINCT ad."activityId") > 1 AND BOOL_AND(ad."isSpecific") = true
ORDER BY num_actividades DESC, d.name;

-- ============================================================
-- PASO 2: Corregir - Marcar como NO específicos
-- ============================================================

-- Actualizar todos los documentos que están en MÚL TIPLES actividades
-- pero marcados como específicos
UPDATE "ActivityDocumentation"
SET "isSpecific" = false
WHERE "documentationId" IN (
  -- Seleccionar documentos que aparecen en más de 1 actividad
  SELECT ad."documentationId"
  FROM "ActivityDocumentation" ad
  GROUP BY ad."documentationId"
  HAVING COUNT(DISTINCT ad."activityId") > 1
)
AND "isSpecific" = true;

-- ============================================================
-- PASO 3: Verificar resultados
-- ============================================================

SELECT 
  d.name AS documento,
  COUNT(DISTINCT ad."activityId") AS num_actividades,
  BOOL_AND(ad."isSpecific") AS todos_especificos,
  BOOL_OR(ad."isSpecific") AS algun_especifico,
  STRING_AGG(DISTINCT a.name, ', ' ORDER BY a.name) AS actividades
FROM "ActivityDocumentation" ad
JOIN "Documentation" d ON d.id = ad."documentationId"
JOIN "Activity" a ON a.id = ad."activityId"
GROUP BY d.id, d.name
ORDER BY num_actividades DESC, d.name;

-- ============================================================
-- PASO 4 (OPCIONAL): Ver documentos realmente específicos
-- ============================================================

-- Documentos que están solo en UNA actividad (realmente específicos)
SELECT 
  d.name AS documento,
  a.name AS actividad_unica,
  ad."isSpecific" AS es_especifico,
  ad.quantity AS cantidad,
  ad.notes AS notas
FROM "ActivityDocumentation" ad
JOIN "Documentation" d ON d.id = ad."documentationId"
JOIN "Activity" a ON a.id = ad."activityId"
WHERE ad."documentationId" IN (
  SELECT ad2."documentationId"
  FROM "ActivityDocumentation" ad2
  GROUP BY ad2."documentationId"
  HAVING COUNT(DISTINCT ad2."activityId") = 1
)
ORDER BY d.name;
