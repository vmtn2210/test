import React, { useEffect, useState } from "react";
import "../../../assets/css/ticketSolution.css";
import { Grid, TextField } from "@mui/material";
import { MDBCol, MDBRow } from "mdb-react-ui-kit";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getDataCategories } from "../../../app/api/category";
import { toast } from "react-toastify";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { createTicketSolution } from "../../../app/api/ticketSolution";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import { getDataUser } from "../../../app/api";

const CreatePayment = () => {
  const navigate = useNavigate();

  const [data, setData] = useState({
    name: "",
    description: "",
    value: 1,
    startDate: "",
    endDate: "",
    parentContractId: 1,
    accountantId: 1,
    companyId: 1,
    attachmentUrl: "",
    serviceIds: []
  });

  const [dataCategories, setDataCategories] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startDate, setStartDate] = useState(moment());
  const [endDate, setEndDate] = useState(moment());
  const [dataUsers, setDataUsers] = useState([]);

  const handleReviewDateChange = (newDate) => {
    const formattedDate = moment(newDate).format("YYYY-MM-DDTHH:mm:ss");
    setStartDate(newDate);
    setData((prevInputs) => ({
      ...prevInputs,
      startDate: formattedDate,
    }));
  };

  const handleExpiredDateChange = (newDate) => {
    const formattedDate = moment(newDate).format("YYYY-MM-DDTHH:mm:ss");
    setEndDate(newDate);
    setData((prevInputs) => ({
      ...prevInputs,
      endDate: formattedDate,
    }));
  };

  const fetchDataSolution = async () => {
    try {
      const fetchCategories = await getDataCategories();
      const fetchUsers = await getDataUser();
      setDataCategories(fetchCategories);
      setDataUsers(fetchUsers);
    } catch (error) {
      console.log("Error while fetching data", error);
    } finally {
    }
  };

  useEffect(() => {
    fetchDataSolution();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "categoryId") {
      const selectedValue = parseInt(value, 10);
      setData((prevData) => ({ ...prevData, [name]: selectedValue }));
    } else {
      setData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const validateDate = (startDate, endDate) => {
    if (!startDate || !endDate) {
      return false; // If either date is missing, return false
    }
    return moment(startDate).isBefore(endDate);
  };

  const handleSubmitContract = async (e) => {
    e.preventDefault();
    if (!data.title) {
      toast.warning("Please fill out all fields");
      return;
    }
    setIsSubmitting(true);
    try {
      let attachmentUrl = data.attachmentUrl;
      if (selectedFile) {
        const storage = getStorage();
        const storageRef = ref(storage, "images/" + selectedFile.name);
        await uploadBytes(storageRef, selectedFile);
        attachmentUrl = await getDownloadURL(storageRef);
      }

      const isDataValid = validateDate(data.startDate, data.endDate);
      if (!isDataValid) {
        toast.info("Start Date must be earlier than End Date.");
        return;
      }

      const formattedReviewDate = moment(data.startDate).format(
        "YYYY-MM-DDTHH:mm:ss"
      );
      const formattedExpiredDate = moment(data.endDate).format(
        "YYYY-MM-DDTHH:mm:ss"
      );

      const updatedData = {
        ...data,
        attachmentUrl: attachmentUrl,
        startDate: formattedReviewDate,
        endDate: formattedExpiredDate,
      };

      setData(updatedData);
      const response = await createTicketSolution({
        name: data.name,
        description: data.description,
        value: data.value,
        startDate: formattedReviewDate,
        endDate: formattedExpiredDate,
        parentContractId: data.parentContractId,
        accountantId: data.accountantId,
        companyId: data.companyId,
        attachmentUrl: attachmentUrl,
      });
      if (
        response.data.isError &&
        response.data.responseException.exceptionMessage
      ) {
        console.log(response.data.responseException.exceptionMessage);
      } else {
        toast.success("Ticket created successfully");
      }
      toast.success("Ticket created successfully");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublicToggle = () => {
    setData((prevData) => ({
      ...prevData,
      isPublic: !prevData.isPublic,
    }));
  };

  const handleGoBack = () => {
    navigate(`/home/contractList`);
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
                    onClick={handleGoBack}
                    className="arrow-back-icon"
                  />
                </button>

                <h2 style={{ marginLeft: "10px" }}>New Contract</h2>
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
              {/* Set justifyContent to 'flex-end' */}
              <Grid item xs={3}>
                <h2 className="align-right">
                  <span style={{ color: "red" }}>*</span>Name
                </h2>
              </Grid>
              <Grid item xs={9}>
                <input
                  id="name"
                  type="text"
                  name="name"
                  className="form-control input-field"
                  value={data.name}
                  onChange={handleInputChange}
                />
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
                        <span style={{ color: "red" }}>*</span>value
                      </h2>
                    </Grid>
                    <Grid item xs={5}>
                      <select
                        id="value"
                        name="value"
                        className="form-select"
                        value={data.value}
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

                <Grid item xs={6}>
                  <Grid container alignItems="center">
                    <Grid item xs={6}>
                      <h2 className="align-right">parentContractId</h2>
                    </Grid>
                    <Grid item xs={5}>
                      <select
                        id="parentContractId"
                        name="parentContractId"
                        className="form-select"
                        value={data.parentContractId}
                        onChange={handleInputChange}
                      >
                        {dataUsers
                          .filter((owner) => owner.id !== "")
                          .map((owner) => (
                            <option key={owner.id} value={owner.id}>
                              {owner.lastName} {owner.firstName}
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
                      <h2 className="align-right">Start Date</h2>
                    </Grid>
                    <Grid item xs={5}>
                      <LocalizationProvider dateAdapter={AdapterMoment}>
                        <DateTimePicker
                          slotProps={{
                            textField: {
                              helperText: `${startDate}`,
                            },
                          }}
                          value={startDate}
                          onChange={(newValue) =>
                            handleReviewDateChange(newValue)
                          }
                          renderInput={(props) => <TextField {...props} />}
                        />
                      </LocalizationProvider>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={6}>
                  <Grid container>
                    <Grid item xs={6}>
                      <h2 className="align-right">End Date</h2>
                    </Grid>
                    <Grid item xs={5}>
                      <LocalizationProvider dateAdapter={AdapterMoment}>
                        <DateTimePicker
                          slotProps={{
                            textField: {
                              helperText: `${endDate}`,
                            },
                          }}
                          value={endDate}
                          onChange={(newValue) =>
                            handleExpiredDateChange(newValue)
                          }
                        />
                      </LocalizationProvider>
                    </Grid>
                  </Grid>
                </Grid>
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
                        <span style={{ color: "red" }}>*</span>accountantId
                      </h2>
                    </Grid>
                    <Grid item xs={5}>
                      <select
                        id="accountantId"
                        name="accountantId"
                        className="form-select"
                        value={data.accountantId}
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

                <Grid item xs={6}>
                  <Grid container alignItems="center">
                    <Grid item xs={6}>
                      <h2 className="align-right">Company </h2>
                    </Grid>
                    <Grid item xs={5}>
                      <select
                        id="companyId"
                        name="companyId"
                        className="form-select"
                        value={data.companyId}
                        onChange={handleInputChange}
                      >
                        {dataUsers
                          .filter((owner) => owner.id !== "")
                          .map((owner) => (
                            <option key={owner.id} value={owner.id}>
                              {owner.lastName} {owner.firstName}
                            </option>
                          ))}
                      </select>
                    </Grid>
                  </Grid>
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
                  onClick={handleSubmitContract}
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

export default CreatePayment;