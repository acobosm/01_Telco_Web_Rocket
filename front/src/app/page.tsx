"use client";

import React, { useState } from "react";
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
  TextField,
  Button,
  IconButton,
  Chip,
  AppBar,
  Toolbar,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudDone as CloudDoneIcon,
  Language as LanguageIcon,
} from "@mui/icons-material";

// Estructura de datos simulados para la maquetación estática
interface CustomerMock {
  customerId: string;
  companyName: string;
  contactName: string;
  contactTitle: string;
  city: string;
  country: string;
  phone: string;
}

const MOCK_CUSTOMERS: CustomerMock[] = [
  {
    customerId: "ALFKI",
    companyName: "Alfreds Futterkiste",
    contactName: "Maria Anders",
    contactTitle: "Sales Representative",
    city: "Berlin",
    country: "Germany",
    phone: "030-0074321",
  },
  {
    customerId: "ANATR",
    companyName: "Ana Trujillo Emparedados y helados",
    contactName: "Ana Trujillo",
    contactTitle: "Owner",
    city: "México D.F.",
    country: "Mexico",
    phone: "(5) 555-4729",
  },
  {
    customerId: "ANTON",
    companyName: "Antonio Moreno Taquería",
    contactName: "Antonio Moreno",
    contactTitle: "Owner",
    city: "México D.F.",
    country: "Mexico",
    phone: "(5) 555-3932",
  },
  {
    customerId: "AROUT",
    companyName: "Around the Horn",
    contactName: "Thomas Hardy",
    contactTitle: "Sales Representative",
    city: "London",
    country: "UK",
    phone: "(171) 555-7788",
  },
  {
    customerId: "BERGS",
    companyName: "Berglunds snabbköp",
    contactName: "Christina Berglund",
    contactTitle: "Order Administrator",
    city: "Luleå",
    country: "Sweden",
    phone: "0921-12 34 56",
  },
];

export default function Home() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState("");

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
              icon={<CloudDoneIcon style={{ color: "#00e5ff" }} />}
              label="API Conectada"
              variant="outlined"
              color="success"
              sx={{ borderColor: "rgba(0, 229, 255, 0.2)", color: "#00e5ff" }}
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
            sx={{
              background: "linear-gradient(45deg, #00e5ff 30%, #00b0ff 90%)",
              color: "#0a0e17",
              boxShadow: "0 3px 5px 2px rgba(0, 229, 255, .3)",
              fontWeight: 700,
            }}
          >
            Nuevo Cliente
          </Button>
        </Box>

        {/* Panel de control de búsqueda y tabla */}
        <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: "background.paper" }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
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
                  <TableCell>ID</TableCell>
                  <TableCell>Empresa</TableCell>
                  <TableCell>Contacto</TableCell>
                  <TableCell>Cargo</TableCell>
                  <TableCell>Ciudad</TableCell>
                  <TableCell>País</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {MOCK_CUSTOMERS.map((row) => (
                  <TableRow key={row.customerId} hover>
                    <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>
                      {row.customerId}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{row.companyName}</TableCell>
                    <TableCell>{row.contactName}</TableCell>
                    <TableCell>{row.contactTitle}</TableCell>
                    <TableCell>{row.city}</TableCell>
                    <TableCell>
                      <Chip label={row.country} size="small" variant="outlined" sx={{ color: "text.secondary" }} />
                    </TableCell>
                    <TableCell>{row.phone}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar">
                        <IconButton color="primary" size="small" sx={{ mr: 1 }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton color="secondary" size="small">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={MOCK_CUSTOMERS.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Registros por página:"
            sx={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", mt: 2 }}
          />
        </Paper>
      </Container>
    </Box>
  );
}
