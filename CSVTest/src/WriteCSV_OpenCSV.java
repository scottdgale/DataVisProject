
import java.io.FileWriter;
import java.util.ArrayList;
import java.util.List;

import com.opencsv.CSVWriter;

public class WriteCSV_OpenCSV {
	public static void main(String args[]) {
		CSVWriter csvWriter = null;
		try {
			// Create CSVWriter for writing to Employee.csv
			csvWriter = new CSVWriter(new FileWriter("Employee.csv", true));
			// List of rows to be written
			List<String[]> rows = new ArrayList<String[]>();
			rows.add(new String[] { "10", "FirstName10", "LastName10", "100000" });
			rows.add(new String[] { "11", "FirstName11", "LastName11", "110000" });
			rows.add(new String[] { "12", "FirstName12", "LastName12", "120000" });
			rows.add(new String[] { "13", "FirstName13", "LastName13", "130000" });
			// Writing list of rows to the csv file
			csvWriter.writeAll(rows);
		} catch (Exception ee) {
			ee.printStackTrace();
		} finally {
			try {
				// closing the writer
				csvWriter.close();
			} catch (Exception ee) {
				ee.printStackTrace();
			}
		}
	}
}
