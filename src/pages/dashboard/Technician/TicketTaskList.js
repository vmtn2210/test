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
  Delete,
  Info,
  Search,
  Settings,
  Square,
  ViewCompact,
} from "@mui/icons-material";
import { formatDate } from "../../helpers/FormatDate";
import { useNavigate, useParams } from "react-router-dom";
import { useCallback } from "react";
import { Box, FormControl, MenuItem, Pagination, Select } from "@mui/material";
import { FaPlus, FaSearch } from "react-icons/fa";
import CustomizedProgressBars from "../../../components/iconify/LinearProccessing";
import { getAllTicketTasks } from "../../../app/api/ticketTask";
import {
  TicketStatusOptions,
  getPriorityOption,
} from "../../helpers/tableComlumn";

const TicketTaskList = () => {
  const [dataListTicketsTask, setDataListTicketsTask] = useState([]);
  const [selectedSolutionIds, setSelectedSolutionIds] = useState([]);
  const [refreshData, setRefreshData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchField, setSearchField] = useState("title");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [sortBy, setSortBy] = useState("id");
  const { ticketId } = useParams();
  const navigate = useNavigate();

  const fetchDataListTicketTask = useCallback(async () => {
    try {
      let filter = "";
      if (searchQuery) {
        filter = `title="${encodeURIComponent(searchQuery)}"`;
      }
      setLoading(true);
      const response = await getAllTicketTasks(
        searchField,
        searchQuery,
        currentPage,
        pageSize,
        sortBy,
        sortDirection,
        ticketId
      );
      setDataListTicketsTask(response);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchField, searchQuery, sortBy, sortDirection]);

  const handleSelectSolution = (solutionId) => {
    if (selectedSolutionIds.includes(solutionId)) {
      setSelectedSolutionIds(
        selectedSolutionIds.filter((id) => id !== solutionId)
      );
    } else {
      setSelectedSolutionIds([...selectedSolutionIds, solutionId]);
    }
  };

  const handleSelectAllSolutions = () => {
    if (selectedSolutionIds.length === dataListTicketsTask.length) {
      setSelectedSolutionIds([]);
    } else {
      setSelectedSolutionIds(
        dataListTicketsTask.map((solution) => solution.id)
      );
    }
  };

  // const handleDeleteSelectedSolutions = (id) => {
  //   try {
  //     console.log("Deleting selected solutions...");

  //     if (selectedSolutionIds.length === 0) {
  //       console.log("No selected solutions to delete.");
  //       return;
  //     }

  //     let currentIndex = 0;

  //     const deleteNextSolution = () => {
  //       if (currentIndex < selectedSolutionIds.length) {
  //         const solutionId = selectedSolutionIds[currentIndex];

  //         deleteTicketSolution(solutionId)
  //           .then(() => {
  //             console.log(
  //               `Solution with ID ${solutionId} deleted successfully`
  //             );
  //             currentIndex++;
  //             deleteNextSolution();
  //           })
  //           .catch((error) => {
  //             console.error(
  //               `Error deleting solution with ID ${solutionId}: `,
  //               error
  //             );
  //             toast.error(
  //               `Error deleting solution with ID ${solutionId}: `,
  //               error
  //             );
  //           });
  //       } else {
  //         setSelectedSolutionIds([]);
  //         toast.success("Selected solutions deleted successfully");
  //         setRefreshData((prev) => !prev);
  //       }
  //     };

  //     deleteNextSolution();
  //   } catch (error) {
  //     console.error("Failed to delete selected solutions: ", error);
  //     toast.error(
  //       "Failed to delete selected solutions, Please try again later"
  //     );
  //   }
  // };

  const handleOpenCreateTask = (ticketId) => {
    navigate(`/home/createTask/${ticketId}`);
  };

  // const handleOpenDetailTicketSolution = (solutionId) => {
  //   navigate(`/home/detailSolution/${solutionId}`);
  // };

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

  useEffect(() => {
    fetchDataListTicketTask();
    setTotalPages(4);
  }, [fetchDataListTicketTask, refreshData]);

  return (
    <section style={{ backgroundColor: "#eee" }}>
      <MDBContainer className="py-5 custom-container">
        {dataListTicketsTask.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Info /> No task available.{" "}
            <span
              onClick={() => handleOpenCreateTask(ticketId)}
              className="blueLink"
            >
              Create new Task
            </span>{" "}
            or <span>Add Task from template</span>
          </div>
        ) : (
          <>
            <MDBNavbar expand="lg" style={{ backgroundColor: "#fff" }}>
              <MDBContainer fluid>
                <MDBNavbarBrand
                  style={{ fontWeight: "bold", fontSize: "24px" }}
                >
                  <ContentCopy style={{ marginRight: "20px" }} /> All Task
                </MDBNavbarBrand>
                <MDBNavbarNav className="ms-auto manager-navbar-nav">
                  <MDBBtn
                    color="#eee"
                    style={{ fontWeight: "bold", fontSize: "20px" }}
                    // onClick={() => handleOpenCreateTicketTask()}
                  >
                    <FaPlus /> Create
                  </MDBBtn>
                  <MDBBtn
                    color="#eee"
                    style={{ fontWeight: "bold", fontSize: "20px" }}
                    // onClick={() => handleDeleteSelectedSolutions()}
                  >
                    <Delete /> Delete
                  </MDBBtn>
                  <MDBBtn
                    color="#eee"
                    style={{ fontWeight: "bold", fontSize: "20px" }}
                    // onClick={handleOpenRequestTicket}
                  >
                    <Settings /> Ticket Task Settings
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
                      <MenuItem value="title">Title</MenuItem>
                      <MenuItem value="description">description</MenuItem>
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
                          fetchDataListTicketTask();
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
                          selectedSolutionIds.length ===
                          dataListTicketsTask.length
                        }
                        onChange={handleSelectAllSolutions}
                      />
                    </th>
                    <th style={{ fontWeight: "bold", fontSize: "18px" }}></th>
                    <th
                      style={{ fontWeight: "bold", fontSize: "18px" }}
                      // onClick={() => handleSortChange("title")}
                    >
                      Title
                    </th>
                    <th
                      style={{ fontWeight: "bold", fontSize: "18px" }}
                      // onClick={() => handleSortChange("keyword")}
                    >
                      Status
                    </th>
                    <th
                      style={{ fontWeight: "bold", fontSize: "18px" }}
                      // onClick={() => handleSortChange("isApproved")}
                    >
                      Team
                    </th>
                    <th
                      style={{ fontWeight: "bold", fontSize: "18px" }}
                      // onClick={() => handleSortChange("isPublic")}
                    >
                      Priority
                    </th>
                    <th style={{ fontWeight: "bold", fontSize: "18px" }}>
                      Start time
                    </th>
                    <th style={{ fontWeight: "bold", fontSize: "18px" }}>
                      End time
                    </th>
                    <th style={{ fontWeight: "bold", fontSize: "18px" }}>
                      Progress
                    </th>
                  </tr>
                </MDBTableHead>
                {loading ? (
                  <CustomizedProgressBars />
                ) : (
                  <MDBTableBody className="bg-light">
                    {dataListTicketsTask.map((TicketSolution, index) => {
                      const isSelected = selectedSolutionIds.includes(
                        TicketSolution.id
                      );
                      const ticketStatusOption = TicketStatusOptions.find(
                        (option) => option.id === TicketSolution.taskStatus
                      );

                      return (
                        <tr key={index}>
                          <td>{TicketSolution.id}</td>
                          <td>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              // onChange={() =>
                              //   handleSelectSolution(TicketSolution.id)
                              // }
                            />
                          </td>
                          <td>
                            <ViewCompact
                            // onClick={() =>
                            //   handleOpenDetailTicketSolution(TicketSolution.id)
                            // }
                            />{" "}
                          </td>
                          <td>{TicketSolution.title}</td>
                          <td>
                            {ticketStatusOption ? (
                              <span style={ticketStatusOption.badgeStyle}>
                                {ticketStatusOption.icon}
                                {ticketStatusOption.name}
                              </span>
                            ) : (
                              "Unknown Status"
                            )}
                          </td>
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
                          <td>{getPriorityOption(TicketSolution.priority)}</td>
                          <td>
                            {formatDate(TicketSolution.scheduledStartTime)}
                          </td>
                          <td>{formatDate(TicketSolution.scheduledEndTime)}</td>
                          <td>
                            <div
                              style={{
                                width: "100%",
                                backgroundColor: "#e0e0df",
                                borderRadius: "5px",
                                padding: "2px",
                              }}
                            >
                              <div
                                style={{
                                  width: `${TicketSolution.progress}%`,
                                  height: "100%",
                                  backgroundColor: "#3399FF",
                                  borderRadius: "5px",
                                  textAlign: "center",
                                  color: "white",
                                }}
                              >
                                {TicketSolution.progress}%
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </MDBTableBody>
                )}
              </MDBTable>
            </div>
          </>
        )}
        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handleChangePage}
          />
        </Box>
      </MDBContainer>
    </section>
  );
};

export default TicketTaskList;
