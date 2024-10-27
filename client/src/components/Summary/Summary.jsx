import React, { useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableContainer,
  Paper,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TableHead,
  TableRow,
  TableCell,
} from "@mui/material";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import SummaryRow from "./SummaryRow";
import SummaryRecordRow from "./SummaryRecordRow";
import { useCustomers } from "../../context/customerContext";
import { usePagination } from "../../hooks/usePagination";
import { useSearch } from "../../hooks/useSearch";
import PaginationFooter from "../Table/PaginationFooter";

const CustomTable = () => {
  const pdfRef = useRef();
  const [data, setData] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");

  const downloadPDF = () => {
    const input = pdfRef.current;
    html2canvas(input, {
      scale: 3,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    }).then((canvas) => {
      const pdf = new jsPDF("l", "mm", "a4", true);
      const pdfWidth = 297;
      const pdfHeight = 210;
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      const imgData = canvas.toDataURL("image/png", 1.0);

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const fileName = `document_${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(fileName);
    });
  };

  const { customers, isLoading, error } = useCustomers();
  const { searchTerm, setSearchTerm, filteredItems } = useSearch(customers, [
    "name",
    "surname",
    "customer_id",
  ]);
  const { currentItems, currentPage, handlePageChange } = usePagination(
    filteredItems,
    15
  );

  const handleDropdownChange = (event) => {
    const selectedUserId = event.target.value;
    const selectedUser = customers.find(
      (user) => user.customer_id === selectedUserId
    );
    if (selectedUser) {
      setData([selectedUser]);
      setSelectedCustomer(selectedUserId);
    }
  };

  return (
    <div style={{ width: "297mm", margin: "0 auto" }}>
      {/* Button and dropdown in a single row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <FormControl style={{ minWidth: 200 }}>
          <InputLabel>Select Customer</InputLabel>
          <Select
            value={selectedCustomer}
            onChange={handleDropdownChange}
            displayEmpty
          >
            {customers.map((customer) => (
              <MenuItem key={customer.customer_id} value={customer.customer_id}>
                {customer.name} {customer.surname}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button onClick={downloadPDF}>Download PDF</Button>
      </div>

      <div ref={pdfRef} style={{ marginTop: 20 }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>รหัสพนักงาน</TableCell>
                <TableCell>ชื่อ</TableCell>
                <TableCell>นามสกุล</TableCell>
                <TableCell>หมายเลขโทรศัพท์</TableCell>
                <TableCell>หมายเลขโทรศัพท์ภายใน</TableCell>
                <TableCell>ตำแหน่ง</TableCell>
                <TableCell>สังกัด</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((selectedRow) => (
                <React.Fragment key={selectedRow.customer_id}>
                  <TableRow style={{ backgroundColor: "#f9f9f9" }}>
                    <TableCell>{selectedRow.customer_id}</TableCell>
                    <TableCell>{selectedRow.name}</TableCell>
                    <TableCell>{selectedRow.surname}</TableCell>
                    <TableCell>{selectedRow.phone}</TableCell>
                    <TableCell>{selectedRow.tel}</TableCell>
                    <TableCell>{selectedRow.role}</TableCell>
                    <TableCell>{selectedRow.group}</TableCell>
                  </TableRow>
                  <SummaryRecordRow customer={selectedRow} />
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      <PaginationFooter
        total={filteredItems.length}
        currentPage={currentPage}
        rowsPerPage={15}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default CustomTable;
