"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  TextField,
  Button,
  IconButton,
  Chip,
  AppBar,
  Toolbar,
  InputAdornment,
  Tooltip,
  Skeleton,
  LinearProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Grid,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudDone as CloudDoneIcon,
  CloudOff as CloudOffIcon,
  Language as LanguageIcon,
} from "@mui/icons-material";

// Estructura de datos que viene del backend
interface Customer {
  customerId: string;
  companyName: string;
  contactName: string | null;
  contactTitle: string | null;
  address: string | null;
  city: string | null;
  region: string | null;
  postalCode: string | null;
  country: string | null;
  phone: string | null;
  fax: string | null;
}

export default function Home() {
  // Estados para datos y control del listado
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [apiConnected, setApiConnected] = useState<boolean>(false);

  // Estados de paginación (MUI usa 0-indexed para la página)
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  // Estados de búsqueda y debounce
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  // Estados de ordenamiento
  const [sortBy, setSortBy] = useState<string>("customerId");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Estado para la alerta de éxito/notificación
  const [toastOpen, setToastOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastSeverity, setToastSeverity] = useState<"success" | "error" | "info">("success");

  // Estados de Diálogos CRUD
  const [formDialogOpen, setFormDialogOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Formulario usando react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    setError: setFormError,
    formState: { errors, isSubmitting },
  } = useForm<Customer>();

  // Efecto de Debounce para el input de búsqueda (400ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0); // Regresar a la primera página cuando cambie el filtro
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  // Función para consultar los clientes del backend
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // La API REST espera 1-indexed para la página, convertimos page + 1
      let url = `http://localhost:8001/customers?page=${page + 1}&per_page=${rowsPerPage}`;

      if (debouncedSearch.trim()) {
        url += `&name_filter=${encodeURIComponent(debouncedSearch.trim())}`;
      }

      if (sortBy) {
        url += `&sort_field=${sortBy}&sort_order=${sortOrder}`;
      }

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Error en el servidor API: ${res.statusText}`);
      }

      const data = await res.json();
      setCustomers(data.data);
      setTotalRecords(data.totalRecords);
      setApiConnected(true);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Imposible conectar con el servidor de desarrollo (Rocket en puerto 8001). Asegúrate de levantarlo con 'cargo run'.");
      setApiConnected(false);
      setCustomers([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos cuando cambie la página, filas por página, búsqueda o parámetros de orden
  useEffect(() => {
    fetchCustomers();
  }, [page, rowsPerPage, debouncedSearch, sortBy, sortOrder]);

  // Manejo de paginación
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Manejo de ordenamiento por columna
  const handleRequestSort = (property: string) => {
    const isAsc = sortBy === property && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setSortBy(property);
    setPage(0);
  };

  // Mostrar Notificaciones Toast
  const showToast = (message: string, severity: "success" | "error" | "info" = "success") => {
    setToastMessage(message);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  // Abrir diálogo de Formulario (Crear)
  const handleOpenCreateDialog = () => {
    setIsEditMode(false);
    reset({
      customerId: "",
      companyName: "",
      contactName: "",
      contactTitle: "",
      address: "",
      city: "",
      region: "",
      postalCode: "",
      country: "",
      phone: "",
      fax: "",
    });
    setFormDialogOpen(true);
  };

  // Abrir diálogo de Formulario (Editar)
  const handleOpenEditDialog = (customer: Customer) => {
    setIsEditMode(true);
    reset({
      ...customer,
      contactName: customer.contactName || "",
      contactTitle: customer.contactTitle || "",
      address: customer.address || "",
      city: customer.city || "",
      region: customer.region || "",
      postalCode: customer.postalCode || "",
      country: customer.country || "",
      phone: customer.phone || "",
      fax: customer.fax || "",
    });
    setFormDialogOpen(true);
  };

  // Cerrar diálogo de formulario
  const handleCloseFormDialog = () => {
    setFormDialogOpen(false);
  };

  // Procesar envío del formulario (Creación y Edición)
  const onSubmitForm = async (data: Customer) => {
    try {
      let url = "http://localhost:8001/customers";
      let method = "POST";

      if (isEditMode) {
        url = `http://localhost:8001/customers/${data.customerId}`;
        method = "PUT";
      }

      // Convertir campos vacíos a null para coincidir con la API
      const processedData = Object.keys(data).reduce((acc: any, key: string) => {
        const val = (data as any)[key];
        acc[key] = typeof val === "string" && val.trim() === "" ? null : val;
        return acc;
      }, {});

      // Forzar ID en mayúsculas
      processedData.customerId = processedData.customerId.toUpperCase();

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(processedData),
      });

      if (!res.ok) {
        if (res.status === 490 || res.status === 409) {
          // ID duplicado
          setFormError("customerId", {
            type: "manual",
            message: "Este ID de Cliente ya se encuentra registrado en el sistema.",
          });
          return;
        }
        throw new Error(`Error en la operación: ${res.statusText}`);
      }

      showToast(
        isEditMode
          ? `Cliente "${processedData.companyName}" actualizado correctamente.`
          : `Cliente "${processedData.companyName}" creado exitosamente.`,
        "success"
      );
      handleCloseFormDialog();
      fetchCustomers();
    } catch (err: any) {
      console.error(err);
      showToast(`Error al procesar la solicitud: ${err.message}`, "error");
    }
  };

  // Abrir diálogo de eliminación
  const handleOpenDeleteDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDeleteDialogOpen(true);
  };

  // Cerrar diálogo de eliminación
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedCustomer(null);
  };

  // Confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!selectedCustomer) return;
    try {
      const url = `http://localhost:8001/customers/${selectedCustomer.customerId}`;
      const res = await fetch(url, { method: "DELETE" });

      if (!res.ok) {
        throw new Error(`Error en la eliminación: ${res.statusText}`);
      }

      showToast(`Cliente "${selectedCustomer.companyName}" eliminado satisfactoriamente.`, "info");
      handleCloseDeleteDialog();
      fetchCustomers();
    } catch (err: any) {
      console.error(err);
      showToast(`Error al eliminar cliente: ${err.message}`, "error");
    }
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Barra de navegación premium */}
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <LanguageIcon color="primary" sx={{ fontSize: 28 }} />
              <Typography variant="h6" component="div" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
                TELCO <span style={{ color: "#00e5ff" }}>WEB</span>
              </Typography>
            </Box>
            <Chip
              icon={apiConnected ? <CloudDoneIcon style={{ color: "#00e5ff" }} /> : <CloudOffIcon style={{ color: "#f50057" }} />}
              label={apiConnected ? "API Conectada" : "API Desconectada"}
              variant="outlined"
              color={apiConnected ? "success" : "error"}
              sx={{
                borderColor: apiConnected ? "rgba(0, 229, 255, 0.2)" : "rgba(245, 0, 87, 0.2)",
                color: apiConnected ? "#00e5ff" : "#f50057",
              }}
            />
          </Toolbar>
        </Container>
      </AppBar>

      {/* Contenido principal */}
      <Container maxWidth="lg" sx={{ mt: 5, pb: 5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>
              Directorio de Clientes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Visualiza, filtra y administra los registros de clientes en la base de datos Northwind.
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
            disabled={!apiConnected}
            sx={{
              background: "linear-gradient(45deg, #00e5ff 30%, #00b0ff 90%)",
              color: "#0a0e17",
              boxShadow: "0 3px 5px 2px rgba(0, 229, 255, .3)",
              fontWeight: 700,
              "&:disabled": {
                background: "rgba(255, 255, 255, 0.12)",
                color: "rgba(255, 255, 255, 0.3)",
              },
            }}
          >
            Nuevo Cliente
          </Button>
        </Box>

        {/* Notificación de Error de Conexión */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} action={
            <Button color="inherit" size="small" onClick={fetchCustomers}>
              Reintentar
            </Button>
          }>
            {error}
          </Alert>
        )}

        {/* Panel de control de búsqueda y tabla */}
        <Paper elevation={0} sx={{ p: 0, mb: 4, bgcolor: "background.paper", overflow: "hidden" }}>
          {loading && <LinearProgress color="primary" />}
          
          <Box sx={{ display: "flex", alignItems: "center", p: 3 }}>
            <TextField
              placeholder="Buscar por nombre de empresa..."
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ width: { xs: "100%", sm: 350 } }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>

          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === "customerId"}
                      direction={sortBy === "customerId" ? sortOrder : "asc"}
                      onClick={() => handleRequestSort("customerId")}
                    >
                      ID
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === "companyName"}
                      direction={sortBy === "companyName" ? sortOrder : "asc"}
                      onClick={() => handleRequestSort("companyName")}
                    >
                      Empresa
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === "contactName"}
                      direction={sortBy === "contactName" ? sortOrder : "asc"}
                      onClick={() => handleRequestSort("contactName")}
                    >
                      Contacto
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === "contactTitle"}
                      direction={sortBy === "contactTitle" ? sortOrder : "asc"}
                      onClick={() => handleRequestSort("contactTitle")}
                    >
                      Cargo
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === "city"}
                      direction={sortBy === "city" ? sortOrder : "asc"}
                      onClick={() => handleRequestSort("city")}
                    >
                      Ciudad
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === "country"}
                      direction={sortBy === "country" ? sortOrder : "asc"}
                      onClick={() => handleRequestSort("country")}
                    >
                      País
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && customers.length === 0 ? (
                  // Mostrar Skeletons si está cargando por primera vez
                  Array.from(new Array(rowsPerPage)).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton variant="text" width="60%" /></TableCell>
                      <TableCell><Skeleton variant="text" width="80%" /></TableCell>
                      <TableCell><Skeleton variant="text" width="70%" /></TableCell>
                      <TableCell><Skeleton variant="text" width="70%" /></TableCell>
                      <TableCell><Skeleton variant="text" width="55%" /></TableCell>
                      <TableCell><Skeleton variant="text" width="40%" /></TableCell>
                      <TableCell><Skeleton variant="text" width="60%" /></TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                          <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
                          <Skeleton variant="circular" width={24} height={24} />
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : customers.length === 0 ? (
                  // Mostrar celda informativa si no hay resultados
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <Typography variant="body1" color="text.secondary">
                        No se encontraron clientes que coincidan con la búsqueda.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  // Renderizar clientes reales de la base de datos
                  customers.map((row) => (
                    <TableRow key={row.customerId} hover>
                      <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>
                        {row.customerId}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{row.companyName}</TableCell>
                      <TableCell>{row.contactName || "-"}</TableCell>
                      <TableCell>{row.contactTitle || "-"}</TableCell>
                      <TableCell>{row.city || "-"}</TableCell>
                      <TableCell>
                        {row.country ? (
                          <Chip label={row.country} size="small" variant="outlined" sx={{ color: "text.secondary" }} />
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>{row.phone || "-"}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Editar">
                          <IconButton color="primary" size="small" onClick={() => handleOpenEditDialog(row)} sx={{ mr: 1 }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton color="secondary" size="small" onClick={() => handleOpenDeleteDialog(row)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalRecords}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Registros por página:"
            sx={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", mt: 2 }}
          />
        </Paper>
      </Container>

      {/* ========================================== */}
      {/* DIÁLOGO: FORMULARIO CREAR / EDITAR CLIENTE */}
      {/* ========================================== */}
      <Dialog
        open={formDialogOpen}
        onClose={handleCloseFormDialog}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor: "background.paper",
              borderRadius: 3,
              p: 1,
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          {isEditMode ? "Editar Información del Cliente" : "Registrar Nuevo Cliente"}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmitForm)}>
          <DialogContent dividers sx={{ borderColor: "rgba(255, 255, 255, 0.08)" }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(12, 1fr)" },
                gap: 2,
              }}
            >
              {/* ID de Cliente */}
              <Box sx={{ gridColumn: { xs: "span 12", sm: "span 6" } }}>
                <TextField
                  label="ID del Cliente (Código)"
                  placeholder="Ej. ALFKI"
                  disabled={isEditMode}
                  fullWidth
                  variant="outlined"
                  size="small"
                  error={!!errors.customerId}
                  helperText={errors.customerId?.message}
                  {...register("customerId", {
                    required: "El ID es obligatorio.",
                    pattern: {
                      value: /^[A-Za-z0-9]{5}$/,
                      message: "Debe constar de exactamente 5 caracteres alfanuméricos.",
                    },
                  })}
                />
              </Box>

              {/* Nombre de la Empresa */}
              <Box sx={{ gridColumn: { xs: "span 12", sm: "span 6" } }}>
                <TextField
                  label="Nombre de la Empresa"
                  placeholder="Ej. Alfreds Futterkiste"
                  fullWidth
                  variant="outlined"
                  size="small"
                  error={!!errors.companyName}
                  helperText={errors.companyName?.message}
                  {...register("companyName", {
                    required: "El nombre de la empresa es obligatorio.",
                    maxLength: {
                      value: 40,
                      message: "Máximo 40 caracteres.",
                    },
                  })}
                />
              </Box>

              {/* Nombre del Contacto */}
              <Box sx={{ gridColumn: { xs: "span 12", sm: "span 6" } }}>
                <TextField
                  label="Nombre del Contacto"
                  placeholder="Ej. Maria Anders"
                  fullWidth
                  variant="outlined"
                  size="small"
                  {...register("contactName")}
                />
              </Box>

              {/* Cargo del Contacto */}
              <Box sx={{ gridColumn: { xs: "span 12", sm: "span 6" } }}>
                <TextField
                  label="Cargo del Contacto"
                  placeholder="Ej. Sales Representative"
                  fullWidth
                  variant="outlined"
                  size="small"
                  {...register("contactTitle")}
                />
              </Box>

              {/* Dirección */}
              <Box sx={{ gridColumn: { xs: "span 12" } }}>
                <TextField
                  label="Dirección"
                  placeholder="Ej. Obere Str. 57"
                  fullWidth
                  variant="outlined"
                  size="small"
                  {...register("address")}
                />
              </Box>

              {/* Ciudad */}
              <Box sx={{ gridColumn: { xs: "span 12", sm: "span 4" } }}>
                <TextField
                  label="Ciudad"
                  placeholder="Ej. Berlín"
                  fullWidth
                  variant="outlined"
                  size="small"
                  {...register("city")}
                />
              </Box>

              {/* Región */}
              <Box sx={{ gridColumn: { xs: "span 12", sm: "span 4" } }}>
                <TextField
                  label="Región"
                  placeholder="Ej. BC o N/A"
                  fullWidth
                  variant="outlined"
                  size="small"
                  {...register("region")}
                />
              </Box>

              {/* Código Postal */}
              <Box sx={{ gridColumn: { xs: "span 12", sm: "span 4" } }}>
                <TextField
                  label="Código Postal"
                  placeholder="Ej. 12209"
                  fullWidth
                  variant="outlined"
                  size="small"
                  {...register("postalCode")}
                />
              </Box>

              {/* País */}
              <Box sx={{ gridColumn: { xs: "span 12", sm: "span 6" } }}>
                <TextField
                  label="País"
                  placeholder="Ej. Alemania"
                  fullWidth
                  variant="outlined"
                  size="small"
                  {...register("country")}
                />
              </Box>

              {/* Teléfono */}
              <Box sx={{ gridColumn: { xs: "span 12", sm: "span 6" } }}>
                <TextField
                  label="Teléfono"
                  placeholder="Ej. 030-0074321"
                  fullWidth
                  variant="outlined"
                  size="small"
                  {...register("phone")}
                />
              </Box>

              {/* Fax */}
              <Box sx={{ gridColumn: { xs: "span 12" } }}>
                <TextField
                  label="Fax"
                  placeholder="Ej. 030-0076545"
                  fullWidth
                  variant="outlined"
                  size="small"
                  {...register("fax")}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCloseFormDialog} color="inherit" disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{
                background: "linear-gradient(45deg, #00e5ff 30%, #00b0ff 90%)",
                color: "#0a0e17",
                fontWeight: 700,
              }}
            >
              {isSubmitting ? "Guardando..." : isEditMode ? "Guardar Cambios" : "Crear Cliente"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ========================================== */}
      {/* DIÁLOGO: CONFIRMACIÓN DE ELIMINACIÓN      */}
      {/* ========================================== */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        slotProps={{
          paper: {
            sx: {
              bgcolor: "background.paper",
              borderRadius: 3,
              p: 1,
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>¿Eliminar Cliente?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "text.secondary" }}>
            ¿Estás completamente seguro de que deseas eliminar al cliente{" "}
            <strong>{selectedCustomer?.companyName}</strong> (Código:{" "}
            <strong>{selectedCustomer?.customerId}</strong>)? Esta acción es permanente y no se
            puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseDeleteDialog} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            sx={{ fontWeight: 700 }}
          >
            Sí, Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================== */}
      {/* TOAST DE NOTIFICACIONES                    */}
      {/* ========================================== */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={6000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToastOpen(false)}
          severity={toastSeverity}
          variant="filled"
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
