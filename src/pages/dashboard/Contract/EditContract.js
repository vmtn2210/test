import React, { useState } from "react";
import "../../../assets/css/ticketSolution.css";
import { Grid, TextField } from "@mui/material";
import { MDBCol, MDBRow } from "mdb-react-ui-kit";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import {
  editTicketSolution,
  getTicketSolutionById,
} from "../../../app/api/ticketSolution";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import moment from "moment";
import { getDataCategories } from "../../../app/api/category";
import { toast } from "react-toastify";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import DateValidation from "../../helpers/DateValidation";
import {
  getAllAccountList,
  getAllCompanyList,
  getContractById,
  getParentContract,
} from "../../../app/api/contract";

const EditContract = () => {
  const navigate = useNavigate();
  const { contractId } = useParams();
  const [data, setData] = useState({
    name: "",
    description: "",
    value: 10000,
    startDate: "",
    endDate: "",
    parentContractId: 1,
    accountantId: 1,
    companyId: 1,
    attachmentUrl: "",
    serviceIds: [],
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [dataParentContract, setDataParentContract] = useState([]);
  const [dataAccountList, setDataAccountList] = useState([]);
  const [dataCompanyList, setDataCompanyList] = useState([]);
  const [startDate, setStartDate] = useState(moment());
  const [endDate, setEndDate] = useState(moment());
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    description: "",
    value: "",
  });

  const handleStartDateChange = (newDate) => {
    const formattedDate = moment(newDate).format("YYYY-MM-DDTHH:mm:ss");
    setStartDate(newDate);
    setData((prevInputs) => ({
      ...prevInputs,
      startDate: formattedDate,
    }));
  };

  const handleEndDateChange = (newDate) => {
    const formattedDate = moment(newDate).format("YYYY-MM-DDTHH:mm:ss");
    setEndDate(newDate);
    setData((prevInputs) => ({
      ...prevInputs,
      endDate: formattedDate,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const fetchDataCreateContract = async () => {
    try {
      const contractParent = await getParentContract();
      const accountList = await getAllAccountList();
      const companyList = await getAllCompanyList();
      setDataParentContract(contractParent);
      setDataAccountList(accountList);
      setDataCompanyList(companyList);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchContractData = async () => {
      try {
        const contractData = await getContractById(contractId);
        setData((prevData) => ({
          ...prevData,
          name: contractData.name,
          description: contractData.description,
          value: contractData.value,
          startDate: contractData.startDate,
          endDate: contractData.endDate,
          parentContractId: contractData.parentContractId,
          accountantId: contractData.accountantId,
          attachmentUrl: contractData.attachmentUrl,
          companyId: contractData.companyId,
        }));
      } catch (error) {
        console.log("Error while fetching solution data", error);
      }
    };
    fetchContractData();
    fetchDataCreateContract();
  }, [contractId]);

  const validateDate = (startDate, endDate) => {
    if (!startDate || !endDate) {
      return false; // If either date is missing, return false
    }
    return moment(startDate).isBefore(endDate);
  };

  const handleEditContract = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!data.name) {
      errors.name = "Name Contract is required";
    }

    if (!data.description) {
      errors.description = "Description Contract is required";
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    let attachmentUrl = data.attachmentUrl;
    if (selectedFile) {
      const storage = getStorage();
      const storageRef = ref(storage, "images/" + selectedFile.name);
      await uploadBytes(storageRef, selectedFile);
      attachmentUrl = await getDownloadURL(storageRef);
    }
    const isDataValid = validateDate(data.startDate, data.endDate);
    if (!isDataValid) {
      toast.info("Review Date must be earlier than Expired Date.");
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
    try {
      const res = await editTicketSolution(contractId, data);
      console.log(res);
      toast.success("Ticket Solution edit successful");
    } catch (error) {
      console.error(error);
      toast.error("Error editing ticket solution");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (
      name === "parentContractId" ||
      name === "accountantId" ||
      name === "companyId"
    ) {
      const selectedValue = parseInt(value, 10);
      setData((prevData) => ({ ...prevData, [name]: selectedValue }));
    } else if (name === "value") {
      const numericValue = parseInt(value);
      if (numericValue >= 10000 && numericValue <= 99999999) {
        setData((prevData) => ({ ...prevData, [name]: numericValue }));
        setFieldErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
      } else {
        setFieldErrors((prevErrors) => ({
          ...prevErrors,
          [name]: "Value must be between 10000 and 99999999",
        }));
      }
    } else {
      setData((prevData) => ({ ...prevData, [name]: value }));
      setFieldErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }

    // setData((prevData) => ({
    //   ...prevData,
    //   [name]: value || "",
    // }));
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

                <h2 style={{ marginLeft: "10px" }}>Edit Contract</h2>
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
                {fieldErrors.name && (
                  <div style={{ color: "red" }}>{fieldErrors.name}</div>
                )}
              </Grid>
              <Grid item xs={3}>
                <h2 className="align-right">
                  <span style={{ color: "red" }}>*</span>Description
                </h2>
              </Grid>
              <Grid item xs={9}>
                <textarea
                  type="content"
                  id="description"
                  name="description"
                  className="form-control input-field-2"
                  rows="6"
                  value={data.description}
                  onChange={handleInputChange}
                />
                {fieldErrors.description && (
                  <div style={{ color: "red" }}>{fieldErrors.description}</div>
                )}
              </Grid>
              <Grid item xs={3}>
                <h2 className="align-right">Attachment</h2>
              </Grid>
              <Grid item xs={9}>
                <input
                  type="file"
                  name="attachmentUrl"
                  className="form-control input-field"
                  id="attachmentUrl"
                  onChange={handleFileChange}
                />
                <div style={{ marginBottom: "10px" }}>
                  {data.attachmentUrl
                    ? data.attachmentUrl.name
                    : "No file selected"}
                </div>
              </Grid>
              <Grid container justifyContent="flex-end">
                <Grid item xs={6}>
                  <Grid container>
                    <Grid item xs={6}>
                      <h2 className="align-right">
                        <span style={{ color: "red" }}>*</span>value
                      </h2>
                    </Grid>
                    <Grid item xs={5}>
                      <input
                        id="value"
                        type="number"
                        name="value"
                        className="form-control input-field"
                        value={data.value}
                        onChange={handleInputChange}
                      />
                      {fieldErrors.value && (
                        <div style={{ color: "red" }}>{fieldErrors.value}</div>
                      )}
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={6}>
                  <Grid container alignItems="center">
                    <Grid item xs={6}>
                      <h2 className="align-right">Parent Contract</h2>
                    </Grid>
                    <Grid item xs={5}>
                      <select
                        id="parentContractId"
                        name="parentContractId"
                        className="form-select"
                        value={data.parentContractId}
                        onChange={handleInputChange}
                      >
                        {dataParentContract
                          .filter((parentContract) => parentContract.id !== "")
                          .map((parentContract) => (
                            <option
                              key={parentContract.id}
                              value={parentContract.id}
                            >
                              {parentContract.name}
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
                            handleStartDateChange(newValue)
                          }
                          renderInput={(props) => <TextField {...props} />}
                        />
                      </LocalizationProvider>
                    </Grid>
                    <DateValidation
                      className="text-center"
                      startDate={data.startDate}
                      endDate={data.endDate}
                    />
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
                          onChange={(newValue) => handleEndDateChange(newValue)}
                          renderInput={(props) => <TextField {...props} />}
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
                        <span style={{ color: "red" }}>*</span>Accountant
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
                        {dataAccountList
                          .filter((accountant) => accountant.id !== "")
                          .map((accountant) => (
                            <option key={accountant.id} value={accountant.id}>
                              {accountant.lastName} {accountant.firstName}
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
                        {dataCompanyList
                          .filter((company) => company.id !== "")
                          .map((company) => (
                            <option key={company.id} value={company.id}>
                              {company.companyName}
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
                  onClick={handleEditContract}
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

export default EditContract;
