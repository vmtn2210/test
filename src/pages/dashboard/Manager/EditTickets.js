import React, { useEffect, useState } from "react";
import "../../../assets/css/ticketSolution.css";
import { Grid, Switch, TextField } from "@mui/material";
import { MDBCol, MDBRow } from "mdb-react-ui-kit";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import AssignApi from "../../../app/api/assign";
import Process, {
  TicketStatusOptions,
  UrgencyOptions,
  priorityOption,
} from "../../helpers/tableComlumn";
import { createTicketTask } from "../../../app/api/ticketTask";
import { getAllTeams } from "../../../app/api/team";
import { getDataCategories } from "../../../app/api/category";
import { getDataUser } from "../../../app/api";
import { getDataMode } from "../../../app/api/mode";
import { getDataServices } from "../../../app/api/service";
import {
  createTicketByManager,
  editTicketByManager,
  getTicketByTicketId,
} from "../../../app/api/ticket";

const EditTickets = () => {
  const navigate = useNavigate();
  const { ticketId } = useParams();
  const [data, setData] = useState({
    requesterId: 1,
    title: "",
    description: "",
    modeId: 1,
    serviceId: 1,
    impactDetail: "",
    ticketStatus: 0,
    priority: 0,
    impact: 0,
    urgency: 0,
    categoryId: 1,
    attachmentUrl: "",
  });
  const [dataCategories, setDataCategories] = useState([]);
  const [dataServices, setDataServices] = useState([]);
  const [dataMode, setDataMode] = useState([]);
  const [dataUser, setDataUser] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDataManager = async () => {
    try {
      const fetchCategories = await getDataCategories();
      const fetchUsers = await getDataUser();
      const fetchModes = await getDataMode();
      const responseService = await getDataServices();
      setDataCategories(fetchCategories);
      setDataServices(responseService);
      setDataUser(fetchUsers);
      setDataMode(fetchModes);
    } catch (error) {
      console.log("Error while fetching data", error);
    } finally {
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "categoryId" || name === "modeId" || name === "serviceId") {
      const selectedValue = parseInt(value, 10);
      setData((prevData) => ({ ...prevData, [name]: selectedValue }));
    } else if (
      name === "priority" ||
      name === "requesterId" ||
      name === "impact" ||
      name === "ticketStatus" ||
      name === "urgency"
    ) {
      const numericValue = parseInt(value, 10);
      setData((prevData) => ({ ...prevData, [name]: numericValue }));
    } else {
      setData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  useEffect(() => {
    const fetchTicketData = async () => {
      try {
        const ticketData = await getTicketByTicketId(ticketId);
        console.log(ticketData);
        setData((prevData) => ({
          ...prevData,
          requesterId: ticketData.requesterId,
          title: ticketData.title,
          description: ticketData.description,
          modeId: ticketData.modeId,
          categoryId: ticketData.categoryId,
          priority: ticketData.priority,
          impactDetail: ticketData.impactDetail,
          ticketStatus: ticketData.ticketStatus,
          scheduledStartTime: ticketData.scheduledStartTime,
          scheduledEndTime: ticketData.scheduledEndTime,
          dueTime: ticketData.dueTime,
          completedTime: ticketData.completedTime,
        }));
      } catch (error) {
        console.error("Error fetching ticket data: ", error);
      }
    };
    fetchTicketData();
    fetchDataManager();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await editTicketByManager(ticketId, data);
      setIsSubmitting(false);
      if (res.isError && res.responseException?.exceptionMessage) {
        toast.info("Ticket is currently being executed and cannot be updated.");
      } else {
        toast.success("Ticket updated successfully");
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        const errorMessage =
          error.response.data?.message ||
          "Ticket can not be updated when it is being executed";
        toast.error(errorMessage);
      } else {
        toast.info("Error updating ticket. Please try again later");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate(`/home/listTicket`);
  };

  return (
    <Grid
      container
      style={{
        border: "1px solid #ccc",
        paddingRight: "10px",
        paddingLeft: "10px",
      }}
    >
      <Grid item xs={12}>
        <MDBCol md="12">
          <MDBRow className="border-box">
            <MDBCol md="5" className="mt-2">
              <div className="d-flex align-items-center">
                <button type="button" className="btn btn-link icon-label">
                  <ArrowBack
                    onClick={() => handleGoBack(ticketId)}
                    className="arrow-back-icon"
                  />
                </button>

                <h2 style={{ marginLeft: "10px" }}>Edit Ticket</h2>
              </div>
            </MDBCol>
          </MDBRow>
        </MDBCol>
        <MDBRow className="mb-4">
          <MDBCol
            md="12"
            className="mt-4"
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}
          >
            <Grid container justifyContent="flex-end">
              {" "}
              <Grid
                container
                justifyContent="flex-end"
                style={{ marginBottom: "20px" }}
              >
                <Grid item xs={6}>
                  <Grid container>
                    <Grid item xs={6}>
                      <h2 className="align-right">
                        <span style={{ color: "red" }}>*</span>Requester
                      </h2>
                    </Grid>
                    <Grid item xs={5}>
                      <select
                        id="requesterId"
                        name="requesterId"
                        className="form-select"
                        value={data.requesterId}
                        onChange={handleInputChange}
                      >
                        {dataUser.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.username}
                          </option>
                        ))}
                      </select>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={6}>
                  <Grid container alignItems="center">
                    <Grid item xs={6}>
                      <h2 className="align-right">Title</h2>
                    </Grid>
                    <Grid item xs={5}>
                      <input
                        id="title"
                        type="text"
                        name="title"
                        className="form-control"
                        value={data.title}
                        onChange={handleInputChange}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={3}>
                <h2 className="align-right">
                  <span style={{ color: "red" }}>*</span>Description
                </h2>
              </Grid>
              <Grid item xs={9}>
                <textarea
                  type="text"
                  id="description"
                  name="description"
                  className="form-control input-field-2"
                  rows="6"
                  value={data.description}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={3}>
                <h2 className="align-right">Attachment</h2>
              </Grid>
              <Grid item xs={9}>
                <input
                  type="file"
                  name="file"
                  className="form-control input-field"
                  id="attachmentUrl"
                  onChange={handleFileChange}
                />
              </Grid>
              <Grid
                container
                justifyContent="flex-end"
                style={{ marginBottom: "20px" }}
              >
                <Grid item xs={6}>
                  <Grid container>
                    <Grid item xs={6}>
                      <h2 className="align-right">
                        <span style={{ color: "red" }}>*</span>Mode Id
                      </h2>
                    </Grid>
                    <Grid item xs={5}>
                      <select
                        id="modeId"
                        name="modeId"
                        className="form-select"
                        value={data.modeId}
                        onChange={handleInputChange}
                      >
                        {dataMode
                          .filter((mode) => mode.id !== "")
                          .map((mode) => (
                            <option key={mode.id} value={mode.id}>
                              {mode.name}
                            </option>
                          ))}
                      </select>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={6}>
                  <Grid container alignItems="center">
                    <Grid item xs={6}>
                      <h2 className="align-right">Service</h2>
                    </Grid>
                    <Grid item xs={5}>
                      <select
                        id="serviceId"
                        name="serviceId"
                        className="form-select"
                        value={data.serviceId}
                        onChange={handleInputChange}
                      >
                        {dataServices
                          .filter((service) => service.id !== "")
                          .map((service) => (
                            <option key={service.id} value={service.id}>
                              {service.description}
                            </option>
                          ))}
                      </select>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Grid container justifyContent="flex-end">
                <Grid item xs={6}>
                  <Grid container>
                    <Grid item xs={6}>
                      <h2 className="align-right">Urgency</h2>
                    </Grid>
                    <Grid item xs={5}>
                      <select
                        id="serviceId"
                        name="serviceId"
                        className="form-select"
                        value={data.urgency}
                        onChange={handleInputChange}
                      >
                        {UrgencyOptions.filter(
                          (urgency) => urgency.id !== ""
                        ).map((urgency) => (
                          <option key={urgency.id} value={urgency.id}>
                            {urgency.name}
                          </option>
                        ))}
                      </select>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={6}>
                  <Grid container>
                    <Grid item xs={6}>
                      <h2 className="align-right">Category</h2>
                    </Grid>
                    <Grid item xs={5}>
                      <select
                        id="categoryId"
                        name="categoryId"
                        className="form-select"
                        value={data.categoryId}
                        onChange={handleInputChange}
                      >
                        {dataCategories
                          .filter((category) => category.id !== "")
                          .map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                      </select>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Grid container justifyContent="flex-end">
                <Grid item xs={6}>
                  <Grid container>
                    <Grid item xs={6}>
                      <h2 className="align-right">Ticket Status</h2>
                    </Grid>
                    <Grid item xs={5}>
                      <select
                        id="ticketStatus"
                        name="ticketStatus"
                        className="form-select"
                        value={data.ticketStatus}
                        onChange={handleInputChange}
                      >
                        {TicketStatusOptions.map((ticketStatus) => (
                          <option key={ticketStatus.id} value={ticketStatus.id}>
                            {ticketStatus.name}
                          </option>
                        ))}
                      </select>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={6}>
                  <Grid container>
                    <Grid item xs={6}>
                      <h2 className="align-right">Priority</h2>
                    </Grid>
                    <Grid item xs={5}>
                      <select
                        id="priority"
                        name="priority"
                        className="form-select"
                        onChange={handleInputChange}
                      >
                        {priorityOption.map((priorityItem) => (
                          <option
                            key={priorityItem.id}
                            value={parseInt(priorityItem.id, 10)}
                          >
                            {priorityItem.name}
                          </option>
                        ))}
                      </select>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={3}>
                  <h2 className="align-right">Impact Detail</h2>
                </Grid>
                <Grid item xs={9}>
                  <input
                    id="impactDetail"
                    type="text"
                    name="impactDetail"
                    className="form-control"
                    value={data.impactDetail}
                    onChange={handleInputChange}
                  />
                </Grid>
              </Grid>
            </Grid>
          </MDBCol>
        </MDBRow>

        <MDBCol md="12">
          <MDBRow className="border-box">
            <MDBCol md="12" className="mt-2 mb-2">
              <div className="d-flex justify-content-center align-items-center">
                <button
                  type="button"
                  className="btn btn-primary custom-btn-margin"
                  onClick={handleSubmitTicket}
                  disabled={isSubmitting}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="btn btn-secondary custom-btn-margin"
                >
                  Save and Approve
                </button>
                <button
                  type="button"
                  className="btn btn-secondary custom-btn-margin"
                >
                  Cancel
                </button>
              </div>
            </MDBCol>
          </MDBRow>
        </MDBCol>
      </Grid>
    </Grid>
  );
};

export default EditTickets;