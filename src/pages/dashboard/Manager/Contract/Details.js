import React from "react";
import {
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import "../../../../assets/css/detailTicket.css";
import PropTypes from "prop-types";
import "../../../../assets/css/homeManager.css";
import { useSelector } from "react-redux";
import { formatDate } from "../../../helpers/FormatDate";
import { formatCurrency } from "../../../helpers/FormatCurrency";
import { useState } from "react";
import { getContractService } from "../../../../app/api/contract";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import UploadComponent from "./UploadComponent";
import { ControlPoint, RemoveCircleOutline } from "@mui/icons-material";

const Details = ({ data, loading, error }) => {
  const user = useSelector((state) => state.auth);
  const { contractId } = useParams();
  const [dataContractService, setDataContractService] = useState([]);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  Details.propTypes = {
    data: PropTypes.object,
    loading: PropTypes.bool.isRequired,
  };

  const closeImagePreview = () => {
    setIsImagePreviewOpen(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const contractData = await getContractService(contractId);
        setDataContractService(contractData);
      } catch (error) {
        console.error("Error fetching contract data: ", error);
      }
    };

    fetchData();
  }, [contractId]);

  const columns = [
    { field: "id", headerName: "ID", width: 200 },
    {
      field: "Name",
      headerName: "Name",
      width: 500,
      editable: true,
    },
    {
      field: "Type",
      headerName: "Type",
      width: 250,
      editable: true,
    },
    {
      field: "amount",
      headerName: "Value(VND)",
      type: "number",
      width: 150,
      editable: true,
    },
    {
      field: "createdAt",
      headerName: "Date Added",
      width: 350,
      editable: true,
    },
  ];

  const formattedDataContractService = dataContractService.map((contract) => ({
    id: contract.id,
    Name: contract.service.description,
    Type: contract.service.type,
    amount: contract.service.amount,
    createdAt: formatDate(contract.createdAt),
  }));

  return (
    <div>
      <Grid container spacing={2} alignItems="center" className="gridContainer">
        <Grid item xs={12}>
          <Table
            style={{
              marginTop: "20px",
              marginBottom: "10px",
              border: "1px solid #000",
            }}
          >
           <TableBody>
  <TableRow>
    <TableCell
      style={{
        background: "#CCCCCC",
        marginTop: "10px",
        textAlign: "right",
        width: "150px", // Adjust the width as needed
      }}
    >
      Name
    </TableCell>
    <TableCell style={{ marginTop: "10px" }}>{data.name}</TableCell>
    <TableCell
      style={{
        background: "#CCCCCC",
        marginTop: "10px",
        textAlign: "right",
        width: "150px", // Adjust the width as needed
      }}
    >
      Active Period
    </TableCell>
    <TableCell style={{ marginTop: "10px" }}>
      {formatDate(data.startDate)} - {formatDate(data.endDate)}
    </TableCell>
  </TableRow>
  <TableRow>
    <TableCell
      style={{
        background: "#CCCCCC",
        marginTop: "10px",
        textAlign: "right",
        width: "150px", // Adjust the width as needed
      }}
    >
      Description
    </TableCell>
    <TableCell style={{ marginTop: "10px" }}>
      {data.description}
    </TableCell>
    <TableCell
      style={{
        background: "#CCCCCC",
        marginTop: "10px",
        textAlign: "right",
        width: "150px", // Adjust the width as needed
      }}
    >
      Parent Contract
    </TableCell>
    <TableCell style={{ marginTop: "10px" }}>
      {data.parentContractId}
    </TableCell>
  </TableRow>
  <TableRow>
    <TableCell
      style={{
        background: "#CCCCCC",
        marginTop: "10px",
        textAlign: "right",
        width: "150px", // Adjust the width as needed
      }}
    >
      Value (VND)
    </TableCell>
    <TableCell style={{ marginTop: "10px" }}>
      {formatCurrency(data.value)} VND
    </TableCell>
    <TableCell
      style={{
        background: "#CCCCCC",
        marginTop: "10px",
        textAlign: "right",
        width: "150px", // Adjust the width as needed
      }}
    >
      Accountant
    </TableCell>
    <TableCell style={{ marginTop: "10px" }}>
      {data &&
        data.accountant &&
        `${data.accountant.lastName} ${data.accountant.firstName}`}
    </TableCell>
  </TableRow>
</TableBody>
          </Table>
          <UploadComponent attachmentURL={data.attachmentURL} />
          <Table
            style={{
              marginTop: "20px",
              marginBottom: "10px",
              border: "1px solid #000",
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell
                  colSpan={4}
                  style={{
                    background: "#EEEEEE",
                    textAlign: "center",
                    fontSize: "18px",
                    textAlign: "left",
                    borderBottom: "2px solid #CCCCCC",
                    fontWeight: "bold",
                  }}
                >
                  Company
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell
                  style={{
                    background: "#CCCCCC",
                    marginTop: "10px",
                    textAlign: "right",
                    width: "150px",
                  }}
                >
                  Company Name
                </TableCell>
                <TableCell style={{ marginTop: "10px", width: "150px" }}>
                  {data.company.companyName}
                </TableCell>
                <TableCell
                  style={{
                    background: "#CCCCCC",
                    marginTop: "10px",
                    textAlign: "right",
                    width: "150px",
                  }}
                >
                  Phone Number
                </TableCell>
                <TableCell style={{ marginTop: "10px" }}>
                  {data.company.phoneNumber}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  style={{
                    background: "#CCCCCC",
                    marginTop: "10px",
                    textAlign: "right",
                  }}
                >
                  Tax Code
                </TableCell>
                <TableCell style={{ marginTop: "10px", width: "150px" }}>
                  {data.company.taxCode}
                </TableCell>
                <TableCell
                  style={{
                    background: "#CCCCCC",
                    marginTop: "10px",
                    textAlign: "right",
                    width: "150px",
                  }}
                >
                  Email
                </TableCell>
                <TableCell style={{ marginTop: "10px", width: "150px" }}>
                  {data.company.email}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  style={{
                    background: "#CCCCCC",
                    marginTop: "10px",
                    textAlign: "right",
                    width: "150px",
                  }}
                >
                  Website
                </TableCell>
                <TableCell style={{ marginTop: "10px", width: "150px" }}>
                  {data.company.website}
                </TableCell>
                <TableCell
                  style={{
                    background: "#CCCCCC",
                    marginTop: "10px",
                    textAlign: "right",
                  }}
                >
                  Address
                </TableCell>
                <TableCell style={{ marginTop: "10px", width: "150px" }}>
                  {" "}
                  {data.company.companyAddress}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  style={{
                    background: "#CCCCCC",
                    marginTop: "10px",
                    textAlign: "right",
                    width: "150px",
                  }}
                >
                  Field Of Address
                </TableCell>
                <TableCell style={{ marginTop: "10px", width: "150px" }}>
                  {data.company.fieldOfBusiness}
                </TableCell>
                <TableCell
                  style={{
                    background: "#CCCCCC",
                    marginTop: "10px",
                    textAlign: "right",
                  }}
                >
                  Company Admin
                </TableCell>
                <TableCell style={{ marginTop: "10px", width: "150px" }}>
                  {" "}
                  {data.company.customerAdmin}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Grid
            container
            spacing={2}
            alignItems="center"
            className="gridContainer"
          >
            <Grid item xs={12}>
              <Table
                style={{
                  marginTop: "20px",
                  border: "1px solid #000",
                }}
              >
                <TableBody>
                  <TableRow>
                    <TableCell
                      colSpan={columns.length + 1} // Span the entire width of the DataGrid
                      style={{
                        background: "#EEEEEE",
                        textAlign: "left",
                        fontSize: "18px",
                        borderBottom: "2px solid #CCCCCC",
                        fontWeight: "bold",
                      }}
                    >
                      Associate Service
                      <Button
                        variant="contained"
                        color="primary"
                        style={{ marginLeft: "10px" }}
                        // onClick={handleAddRow}
                      >
                        <ControlPoint /> Add
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        style={{ marginLeft: "10px" }}
                        // onClick={handleAddRow}
                      >
                        <RemoveCircleOutline  /> Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <DataGrid
                rows={formattedDataContractService}
                columns={columns}
                initialState={{
                  pagination: {
                    paginationModel: {
                      pageSize: 5,
                    },
                  },
                }}
                pageSizeOptions={[5]}
                checkboxSelection
                disableRowSelectionOnClick
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

export default Details;
