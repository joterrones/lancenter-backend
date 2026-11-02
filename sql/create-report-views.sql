-- Vistas de reportes usadas por ValetorPC y la API Lancenter.
-- Ejecutar en PostgreSQL si no existen aún (no altera tablas base).

CREATE OR REPLACE VIEW v_ultimasventas AS
SELECT id, fecha, codigo_equipo, total_hora, tota_producto, total
FROM v_venta
WHERE pagado = 1
ORDER BY id DESC;

CREATE OR REPLACE VIEW v_resumen_diario AS
SELECT
  to_char(fecha::date, 'DD/MM/YYYY') AS fecha,
  COALESCE(SUM(total_hora), 0) AS total_hora,
  COALESCE(SUM(tota_producto), 0) AS tota_producto,
  COALESCE(SUM(total), 0) AS total
FROM v_venta
WHERE pagado = 1
GROUP BY fecha::date
ORDER BY fecha::date DESC;
