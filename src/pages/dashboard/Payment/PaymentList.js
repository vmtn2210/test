import {
  MDBBtn,
  MDBContainer,
  MDBNavbar,
  MDBNavbarBrand,
  MDBNavbarNav,
  MDBTable,
  MDBTableBody,
  MDBTableHead,
} from "mdb-react-ui-kit";
import React, { useEffect, useState } from "react";
import "../../../assets/css/ticketCustomer.css";
import PageSizeSelector from "../Pagination/Pagination";
import {
  ContentCopy,
  Lock,
  LockOpen,
  Square,
  ViewCompact,
} from "@mui/icons-material";
import { formatDate } from "../../helpers/FormatDate";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { Box, FormControl, MenuItem, Pagination, Select } from "@mui/material";
import { FaPlus, FaSearch } from "react-icons/fa";
import {
  deleteTicketSolution,
} from "../../../app/api/ticketSolution";
import { toast } from "react-toastify";
import CustomizedProgressBars from "../../../components/iconify/LinearProccessing";
import { getAllContract, getAllContracts } from "../../../app/api/contract";

const ContractList = () => {
  const [dataListContract, setDataListContract] = useState([]);
  const [selectedContractIds, setSelectedContractIds] = useState([]);
  const [refreshData, setRefreshData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [searchField, setSearchField] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [sortBy, setSortBy] = useState("id");
  const navigate = useNavigate();

  // const fetchDataListContract = useCallback(async () => {
  //   try {
  //     let filter = "";
  //     if (searchQuery) {
  //       filter = `title="${encodeURIComponent(searchQuery)}"`;
  //     }
  //     setLoading(true);
  //     const response = await getAllContract(
  //       searchField,
  //       searchQuery,
  //       currentPage,
  //       pageSize,
  //     );
  //     setDataListContract(response);
  //   } catch (error) {
  //     console.log(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [currentPage, pageSize, searchField, searchQuery ]);

  const fetchDataListContract = async () => {
    try {
      setLoading(true);
      const response = await getAllContracts();
      setDataListContract(response);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };



  const handleSelectSolution = (solutionId) => {
    if (selectedContractIds.includes(solutionId)) {
      setSelectedContractIds(
        selectedContractIds.filter((id) => id !== solutionId)
      );
    } else {
      setSelectedContractIds([...selectedContractIds, solutionId]);
    }
  };

  const handleSelectAllSolutions = () => {
    if (selectedContractIds.length === dataListContract.length) {
      setSelectedContractIds([]);
    } else {
      setSelectedContractIds(
        dataListContract.map((solution) => solution.id)
      );
    }
  };

  const handleDeleteSelectedSolutions = (id) => {
    try {
      console.log("Deleting selected solutions...");

      if (selectedContractIds.length === 0) {
        console.log("No selected solutions to delete.");
        return;
      }

      let currentIndex = 0;

      const deleteNextSolution = () => {
        if (currentIndex < selectedContractIds.length) {
          const solutionId = selectedContractIds[currentIndex];

          deleteTicketSolution(solutionId)
            .then(() => {
              console.log(
                `Solution with ID ${solutionId} deleted successfully`
              );
              currentIndex++;
              deleteNextSolution();
            })
            .catch((error) => {
              console.error(
                `Error deleting solution with ID ${solutionId}: `,
                error
              );
              toast.error(
                `Error deleting solution with ID ${solutionId}: `,
                error
              );
            });
        } else {
          setSelectedContractIds([]);
          toast.success("Selected solutions deleted successfully");
          setRefreshData((prev) => !prev);
        }
      };

      deleteNextSolution();
    } catch (error) {
      console.error("Failed to delete selected solutions: ", error);
      toast.error(
        "Failed to delete selected solutions, Please try again later"
      );
    }
  };

  const handleOpenCreateTicketSolution = () => {
    navigate("/home/createContract");
  };

  const handleOpenDetailTicketSolution = (solutionId) => {
    navigate(`/home/detailSolution/${solutionId}`);
  };

  const handleChangePage = (event, value) => {
    setCurrentPage(value);
  };

  const handleChangePageSize = (event) => {
    const newSize = parseInt(event.target.value);
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  // useEffect(() => {
  //   fetchDataListContract();
  //   setTotalPages(4);
  // }, [fetchDataListContract, refreshData]);
  useEffect(() => {
    fetchDataListContract();
    setTotalPages(4);
  }, []);

  return (
    <section style={{ backgroundColor: "#eee" }}>
      <MDBContainer className="py-5 custom-container">
        <MDBNavbar expand="lg" light bgColor="inherit">
          <MDBContainer fluid>
            <MDBNavbarBrand style={{ fontWeight: "bold", fontSize: "16px" }}>
              <ContentCopy style={{ marginRight: "20px" }} /> All Contracts
            </MDBNavbarBrand>
            <MDBNavbarNav className="ms-auto manager-navbar-nav">
              <MDBBtn
                color="#eee"
                style={{ fontWeight: "bold", fontSize: "14px" }}
                onClick={() => handleOpenCreateTicketSolution()}
              >
                <FaPlus /> New
              </MDBBtn>
              <MDBBtn
                color="#eee"
                style={{ fontWeight: "bold", fontSize: "14px" }}
                onClick={() => handleDeleteSelectedSolutions()}
              >
                Delete
              </MDBBtn>

              <FormControl
                variant="outlined"
                style={{
                  minWidth: 120,
                  marginRight: 10,
                  marginTop: 10,
                  marginLeft: 10,
                }}
                size="small"
              >
                <Select
                  value={searchField}
                  onChange={(e) => setSearchField(e.target.value)}
                  inputProps={{
                    name: "searchField",
                    id: "search-field",
                  }}
                >
                  <MenuItem value="id">ID</MenuItem>
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="description">Description</MenuItem>
                  <MenuItem value="value">Value</MenuItem>
                  <MenuItem value="status">Status</MenuItem>
                  <MenuItem value="startDate">StartDate</MenuItem>
                </Select>
              </FormControl>
              <div className="input-wrapper">
                <FaSearch id="search-icon" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      fetchDataListContract();
                    }
                  }}
                  className="input-search"
                  placeholder="Type to search..."
                />
              </div>
              <PageSizeSelector
                pageSize={pageSize}
                handleChangePageSize={handleChangePageSize}
              />
            </MDBNavbarNav>
          </MDBContainer>
        </MDBNavbar>
        <div>
          <MDBTable className="align-middle mb-0" responsive>
            <MDBTableHead className="bg-light">
              <tr>
                <th style={{ fontWeight: "bold", fontSize: "18px" }}>ID</th>
                <th style={{ fontWeight: "bold", fontSize: "18px" }}>
                  <input
                    type="checkbox"
                    checked={
                      selectedContractIds.length ===
                      dataListContract.length
                    }
                    onChange={handleSelectAllSolutions}
                  />
                </th>
                <th style={{ fontWeight: "bold", fontSize: "14px" }}></th>
                <th
                  style={{ fontWeight: "bold", fontSize: "14px" }}
                  onClick={() => handleSortChange("name")}
                >
                  Name
                </th>
                <th
                  style={{ fontWeight: "bold", fontSize: "14px" }}
                  onClick={() => handleSortChange("description")}
                >
                  Description
                </th>
                <th
                  style={{ fontWeight: "bold", fontSize: "14px" }}
                  onClick={() => handleSortChange("value")}
                >
                  Status
                </th>
                <th
                  style={{ fontWeight: "bold", fontSize: "14px" }}
                  onClick={() => handleSortChange("status")}
                >
                  Visibility
                </th>
                <th style={{ fontWeight: "bold", fontSize: "14px" }}>
                  Review Date
                </th>
                <th style={{ fontWeight: "bold", fontSize: "14px" }}>
                  Created
                </th>
                <th style={{ fontWeight: "bold", fontSize: "14px" }}>
                  Last Update
                </th>
              </tr>
            </MDBTableHead>
            {loading ? (
              <CustomizedProgressBars />
            ) : (
              <MDBTableBody className="bg-light">
                {dataListContract.map((TicketSolution, index) => {
                  const isSelected = selectedContractIds.includes(
                    TicketSolution.id
                  );
                  return (
                    <tr key={index}>
                      <td>{TicketSolution.id}</td>
                      <td>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() =>
                            handleSelectSolution(TicketSolution.id)
                          }
                        />
                      </td>
                      <td>
                        <ViewCompact
                          onClick={() =>
                            handleOpenDetailTicketSolution(TicketSolution.id)
                          }
                        />{" "}
                      </td>
                      <td>{TicketSolution.title}</td>
                      <td>{TicketSolution.keyword}</td>
                      <td>
                        {TicketSolution.isApproved ? (
                          <>
                            <Square
                              className="square-icon"
                              style={{ color: "green" }}
                            />
                            <span>Approved</span>
                          </>
                        ) : (
                          <>
                            <Square className="square-icon" />
                            <span>Not Approved</span>
                          </>
                        )}
                      </td>
                      <td>
                        {TicketSolution.isPublic ? (
                          <>
                            <LockOpen
                              className="square-icon"
                              style={{ color: "green" }}
                            />{" "}
                            <span>Public</span>
                          </>
                        ) : (
                          <>
                            <Lock className="square-icon" /> Private
                          </>
                        )}
                      </td>
                      <td>{formatDate(TicketSolution.reviewDate)}</td>
                      <td>
                        {TicketSolution.createdAt
                          ? new Date(
                              TicketSolution.createdAt
                            ).toLocaleDateString()
                          : ""}
                      </td>
                      <td>{formatDate(TicketSolution.modifiedAt)}</td>
                    </tr>
                  );
                })}
              </MDBTableBody>
            )}
          </MDBTable>
        </div>
      </MDBContainer>
      <Box display="flex" justifyContent="center" mt={2}>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handleChangePage}
        />
      </Box>
    </section>
  );
};

export default ContractList;
