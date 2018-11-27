
import java.io.FileReader;
import java.io.FileWriter;
import java.util.ArrayList;
import java.util.List;

import com.opencsv.CSVReader;
import com.opencsv.CSVWriter;

public class ReadCSV_OpenCSV {
	public static void main(String args[]) {

		CSVReader csvReader = null;

		try {
			/**
			 * Reading the CSV File Delimiter is comma Start reading from line 1
			 */
			csvReader = new CSVReader(new FileReader("countries.csv"));

			// employeeDetails stores the values current line
			String[] employeeDetails = null;
			// List for holding all the rows
			List<String[]> countries = new ArrayList<String[]>();

			countries = csvReader.readAll();
			// Read individual row from List of rows
			for (String[] country : countries) {

				for (int i = 1990; i < 2015; i++) {
					CSVReader yearReader = null;
					yearReader = new CSVReader(new FileReader("Data/Dyadic/Dyadic_" + i + ".csv"));

					List<String[]> data = new ArrayList<String[]>();
					List<String[]> filteredData = new ArrayList<String[]>();
					data = yearReader.readAll();

					for (String[] datum : data) {
						// System.out.println(Arrays.toString(datum));
						String[] temp = new String[7];
						if (datum[2].equals(country[0])) { // importer 1 is pri -- flow1 import flow 2 export
							filteredData.add(datum);
						}
						if (datum[4].equals(country[0])) { // importer 2 is pri -- flow2 import flow1 export
							temp[0] = datum[0];
							temp[1] = datum[3];
							temp[2] = datum[4];
							temp[3] = datum[1];
							temp[4] = datum[2];
							temp[5] = datum[6];
							temp[6] = datum[5];

							filteredData.add(temp);

						}
//
//						if (datum[2].equals(country[0]) || datum[4].equals(country[0])) {
//							// add to list
//							
//							filteredData.add(datum);
//
//						} else {
//							// System.out.println("Nope");
//						}
					}

					// write filteredData to csv
					if (!filteredData.isEmpty()) {
						CSVWriter csvWriter = null;
						csvWriter = new CSVWriter(new FileWriter(
								"Data/newStuff/" + i + "/" + country[0] + "_Dyadic_" + i + ".csv", true));

						String[] headerRecord = { "Year", "PrimaryName", "PrimaryId", "SecondaryName", "SecondaryId",
								"Imports", "Exports" };
						csvWriter.writeNext(headerRecord);

						csvWriter.writeAll(filteredData);
						csvWriter.close();
					}

					yearReader.close();

				}

			}

		} catch (Exception ee) {
			ee.printStackTrace();
		} finally {
			try {
				// closing the reader
				csvReader.close();
			} catch (Exception ee) {
				ee.printStackTrace();
			}
		}
	}
}