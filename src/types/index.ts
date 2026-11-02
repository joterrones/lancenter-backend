export interface Equipo {
  id: number;
  codigo: string;
  codigoTipoEquipo: string;
  precioq: number;
  preciom: number;
  precioh: number;
  preciot: number;
  fechaInicio: string | null;
  fechaFin: string | null;
  restante: number | null;
  minutos: number | null;
  total: number | null;
}

export interface Venta {
  id: number;
  idEquipo: number;
  pagado: number;
  codigoEquipo?: string;
  totalHora: number;
  totalProducto: number;
  total: number;
  fechaInicio: string | null;
  fechaFin: string | null;
  restante: number | null;
  comentario: string | null;
  acuenta: number;
  vuelto: number;
}

export interface VentaHora {
  id: number;
  idVenta: number;
  hora: number;
  horaText: string;
  precio: number;
  pagado: number;
  nPago: number;
}

export interface VentaProducto {
  id: number;
  idProducto: number;
  nombre: string;
  cantidad: number;
  precio: number;
  pagado: number;
  idVenta: number;
  total: number;
  nPago: number;
}

export interface Producto {
  id: number;
  idTipoProducto: number;
  codigo: string;
  nombre: string;
  precio: number;
  tieneVentas?: boolean;
}

export interface TipoProducto {
  id: number;
  codigo: string;
  nombre: string;
}

export interface ResumenDiario {
  fecha: string;
  totalAlquiler: number;
  totalProducto: number;
  total: number;
}

export interface UltimaVenta {
  id: number;
  fecha: string;
  equipo: string;
  totalAlquiler: number;
  totalProducto: number;
  total: number;
}

export interface VentaDetalle {
  venta: Venta;
  horas: VentaHora[];
  productos: VentaProducto[];
}
